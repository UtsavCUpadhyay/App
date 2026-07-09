import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

import type { Repositories } from '../../domain/repositories.js';
import type {
  AdminRole,
  AdminUser,
  Report,
  ReportStatus,
} from '../../domain/types.js';
import { HttpError } from '../../shared/http-error.js';

/**
 * Admin authentication + the moderation queue. Admin accounts are entirely
 * separate from consumer accounts (Phase 7: the admin portal is a distinct app;
 * Phase 10: RBAC + every action written to the audit log). MFA is mandatory in
 * production — modelled here, enforcement deferred (Roadmap).
 */
export class AdminService {
  constructor(private readonly repos: Repositories) {}

  async createAdmin(email: string, password: string, role: AdminRole): Promise<AdminUser> {
    if (await this.repos.admins.findByEmail(email)) {
      throw new HttpError(409, 'An admin with this email already exists');
    }
    const admin: AdminUser = {
      id: randomUUID(),
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      role,
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
    };
    return this.repos.admins.create(admin);
  }

  async authenticate(email: string, password: string): Promise<AdminUser> {
    const admin = await this.repos.admins.findByEmail(email);
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      throw new HttpError(401, 'Invalid email or password');
    }
    return admin;
  }

  async listQueue(status: ReportStatus = 'open'): Promise<Report[]> {
    return this.repos.reports.list({ status });
  }

  /**
   * Resolve or dismiss a report. Records who acted and writes an audit entry —
   * the accountability trail store reviewers and regulators expect.
   */
  async actOnReport(
    adminId: string,
    reportId: string,
    next: { status: Extract<ReportStatus, 'reviewing' | 'resolved' | 'dismissed'>; notes?: string },
  ): Promise<Report> {
    const report = await this.repos.reports.get(reportId);
    if (!report) throw new HttpError(404, 'Report not found');

    const updated: Report = {
      ...report,
      status: next.status,
      assignedAdminId: adminId,
      resolutionNotes: next.notes ?? report.resolutionNotes,
      resolvedAt:
        next.status === 'resolved' || next.status === 'dismissed'
          ? new Date().toISOString()
          : null,
    };
    const saved = await this.repos.reports.save(updated);
    await this.repos.audit.append({
      actorId: adminId,
      actorType: 'admin',
      action: `report.${next.status}`,
      targetId: reportId,
    });
    return saved;
  }
}

/**
 * Bootstrap: create the first superadmin from env if none exists. Safe to call
 * on startup — a no-op once an admin is present. Dev/ops use only.
 */
export async function ensureBootstrapAdmin(
  repos: Repositories,
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  if ((await repos.admins.count()) > 0) return;
  const email = env.ADMIN_EMAIL;
  const password = env.ADMIN_PASSWORD;
  if (!email || !password) return;
  await new AdminService(repos).createAdmin(email, password, 'superadmin');
}
