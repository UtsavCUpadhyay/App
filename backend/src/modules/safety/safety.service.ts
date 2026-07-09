import { randomUUID } from 'node:crypto';

import type { Repositories } from '../../domain/repositories.js';
import type { Block, Report, ReportCategory } from '../../domain/types.js';
import { HttpError } from '../../shared/http-error.js';

/** Consumer-facing safety actions: report and block (Phase 12 Safety Center). */
export class SafetyService {
  constructor(private readonly repos: Repositories) {}

  async report(
    reporterId: string,
    input: {
      reportedUserId: string;
      category: ReportCategory;
      reason?: string;
      conversationId?: string;
    },
  ): Promise<Report> {
    if (reporterId === input.reportedUserId) {
      throw new HttpError(400, 'You cannot report yourself');
    }
    if (!(await this.repos.users.findById(input.reportedUserId))) {
      throw new HttpError(404, 'That member does not exist');
    }
    const report: Report = {
      id: randomUUID(),
      reporterId,
      reportedUserId: input.reportedUserId,
      conversationId: input.conversationId ?? null,
      category: input.category,
      reason: input.reason ?? '',
      status: 'open',
      assignedAdminId: null,
      resolutionNotes: null,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };
    const saved = await this.repos.reports.create(report);
    await this.repos.audit.append({
      actorId: reporterId,
      actorType: 'user',
      action: 'report.created',
      targetId: input.reportedUserId,
    });
    return saved;
  }

  async block(blockerId: string, blockedId: string): Promise<Block> {
    if (blockerId === blockedId) throw new HttpError(400, 'You cannot block yourself');
    if (!(await this.repos.users.findById(blockedId))) {
      throw new HttpError(404, 'That member does not exist');
    }
    const block: Block = {
      blockerId,
      blockedId,
      createdAt: new Date().toISOString(),
    };
    return this.repos.blocks.create(block);
  }

  async unblock(blockerId: string, blockedId: string): Promise<void> {
    await this.repos.blocks.remove(blockerId, blockedId);
  }

  async listBlocks(blockerId: string): Promise<Block[]> {
    return this.repos.blocks.listByBlocker(blockerId);
  }
}
