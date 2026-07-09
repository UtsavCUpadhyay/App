import type { ModerationCategory, ModerationResult } from '../../domain/types.js';

/**
 * Moderation provider seam (Phase 16). Chat calls `scan()` on every message
 * before it is stored. The rules-based provider below is fast, free, and
 * deterministic — it catches the dominant real-world dating-scam patterns
 * today. A hosted-LLM provider can implement this same interface later for
 * nuanced abuse/context detection without touching the chat module.
 */
export interface ModerationProvider {
  scan(text: string): Promise<ModerationResult> | ModerationResult;
}

const CLEAN: ModerationResult = { flagged: false, category: 'none', reason: null };

interface Rule {
  category: Exclude<ModerationCategory, 'none'>;
  pattern: RegExp;
  reason: string;
}

/**
 * Ordered by severity — financial scams are the dominant real-world dating-scam
 * vector, so they win when multiple rules match. Patterns favour recall on the
 * classic scam shapes; the human review queue (Phase 10 layer 5) is the
 * backstop for false positives — we flag, we never auto-block.
 */
const RULES: Rule[] = [
  {
    category: 'financial_scam',
    // Word boundaries are applied per-token, not around the whole group — a
    // leading \b before "$" never matches (space→$ is not a word boundary).
    pattern:
      /(?:\$\s?\d|\b\d+\s?(?:aud|usd|dollars?)\b|\b(?:money|transfer|wire|western union|money ?gram|gift ?cards?|bitcoin|btc|ethereum|eth|crypto(?:currency)?|usdt|paypal|venmo|cash ?app|zelle)\b|\binvestment opportunity\b|\binvest with\b|send (?:me )?(?:some )?(?:cash|funds))/i,
    reason:
      'This message mentions money or crypto. Aurelle members never ask for transfers — be cautious and consider reporting.',
  },
  {
    category: 'contact_exfiltration',
    pattern:
      /\b(?:whats ?app|telegram|signal app|kik|snapchat|insta(?:gram)?|my (?:number|email) is|text me on|hit me up on|\+?\d[\d\s().-]{7,}\d|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/i,
    reason:
      'This message tries to move the conversation off Aurelle. Scammers often do this early — staying here keeps our safety tools working.',
  },
  {
    category: 'harassment',
    // Deliberately conservative: threats + a small slur/abuse set. Real system
    // uses a maintained lexicon + the LLM provider; kept minimal here.
    pattern:
      /\b(?:kill yourself|kys|i(?:'| a)?m going to (?:hurt|find) you|you(?:'| a)?re (?:worthless|disgusting|a slut|a whore))\b/i,
    reason:
      'This message may contain abusive or threatening language. You can report or block this member from the Safety Center.',
  },
];

/** Rules-based moderation: deterministic scam/abuse detection. */
export class RulesModerationProvider implements ModerationProvider {
  scan(text: string): ModerationResult {
    for (const rule of RULES) {
      if (rule.pattern.test(text)) {
        return { flagged: true, category: rule.category, reason: rule.reason };
      }
    }
    return CLEAN;
  }
}
