import { describe, expect, it } from 'vitest';

import { RulesModerationProvider } from '../src/modules/moderation/moderation.service.js';

const mod = new RulesModerationProvider();

describe('RulesModerationProvider', () => {
  it('passes ordinary conversation clean', () => {
    const r = mod.scan('Tamarama on a quiet morning. What about you?');
    expect(r.flagged).toBe(false);
    expect(r.category).toBe('none');
    expect(r.reason).toBeNull();
  });

  it.each([
    'Could you help me out with a $200 transfer today?',
    'I have a great investment opportunity in bitcoin',
    'send me some funds via cash app',
    'buy me a gift card and I’ll pay you back',
  ])('flags financial scam: %s', (text) => {
    const r = mod.scan(text);
    expect(r.flagged).toBe(true);
    expect(r.category).toBe('financial_scam');
    expect(r.reason).toContain('money');
  });

  it.each([
    "let's move this to whatsapp",
    'my number is 0412 345 678',
    'email me at scammer@example.com',
  ])('flags contact exfiltration: %s', (text) => {
    const r = mod.scan(text);
    expect(r.flagged).toBe(true);
    expect(r.category).toBe('contact_exfiltration');
  });

  it('flags harassment/threats', () => {
    expect(mod.scan('kill yourself').category).toBe('harassment');
  });

  it('prioritises financial scam when multiple patterns match', () => {
    const r = mod.scan('send me $50 on whatsapp');
    expect(r.category).toBe('financial_scam');
  });

  it('does not false-positive on innocuous lookalikes', () => {
    expect(mod.scan('that was an instant classic').flagged).toBe(false);
    expect(mod.scan('I love investing my time in good books').flagged).toBe(false);
  });
});
