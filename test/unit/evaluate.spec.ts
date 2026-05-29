import { evaluate } from '../../src/domain/evaluation/evaluate';
import { EvaluationInput } from '../../src/domain/evaluation/evaluation-input';
import { QuietHours } from '../../src/domain/quiet-hours/quiet-hours';

// A baseline allow-able input; individual tests override only what they exercise.
const base: EvaluationInput = {
  type: 'MARKETING',
  channel: 'EMAIL',
  region: 'US',
  datetime: new Date('2026-05-21T12:00:00Z'),
  userPreference: undefined,
  defaultEnabled: true,
  quietHours: undefined,
  hasMatchingPolicy: false,
};

describe('evaluate — global policy', () => {
  it('denies when a matching policy exists, even if the user enabled it', () => {
    const result = evaluate({ ...base, hasMatchingPolicy: true, userPreference: true });
    expect(result).toEqual({ decision: 'deny', reason: 'blocked_by_global_policy' });
  });
});

describe('evaluate — defaults', () => {
  it('denies a default-off type for a new user', () => {
    const result = evaluate({ ...base, defaultEnabled: false, userPreference: undefined });
    expect(result).toEqual({ decision: 'deny', reason: 'disabled_by_default' });
  });

  it('allows a default-on type with nothing else in the way', () => {
    const result = evaluate({ ...base, defaultEnabled: true });
    expect(result).toEqual({ decision: 'allow' });
  });
});

describe('evaluate — user preference', () => {
  it('denies when the user explicitly disabled it (default on)', () => {
    const result = evaluate({ ...base, defaultEnabled: true, userPreference: false });
    expect(result).toEqual({ decision: 'deny', reason: 'disabled_by_user_preference' });
  });

  it('allows when the user explicitly enabled a default-off type', () => {
    const result = evaluate({ ...base, defaultEnabled: false, userPreference: true });
    expect(result).toEqual({ decision: 'allow' });
  });
});

describe('evaluate — quiet hours', () => {
  const within = new Date('2026-01-15T22:30:00Z'); // 23:30 Berlin (winter)
  const qh = new QuietHours('22:00', '08:00', 'Europe/Berlin');

  it('denies a marketing notification inside the window', () => {
    const result = evaluate({ ...base, type: 'MARKETING', datetime: within, quietHours: qh });
    expect(result).toEqual({ decision: 'deny', reason: 'quiet_hours' });
  });

  it('allows a transactional notification inside the window (bypass)', () => {
    const result = evaluate({ ...base, type: 'TRANSACTIONAL', datetime: within, quietHours: qh });
    expect(result).toEqual({ decision: 'allow' });
  });

  it('allows a marketing notification outside the window', () => {
    const outside = new Date('2026-01-15T12:00:00Z'); // 13:00 Berlin
    const result = evaluate({ ...base, type: 'MARKETING', datetime: outside, quietHours: qh });
    expect(result).toEqual({ decision: 'allow' });
  });
});

describe('evaluate — precedence', () => {
  const within = new Date('2026-01-15T22:30:00Z');
  const qh = new QuietHours('22:00', '08:00', 'Europe/Berlin');

  it('policy beats user-disabled and quiet hours', () => {
    const result = evaluate({
      ...base,
      type: 'MARKETING',
      datetime: within,
      quietHours: qh,
      userPreference: false,
      hasMatchingPolicy: true,
    });
    expect(result).toEqual({ decision: 'deny', reason: 'blocked_by_global_policy' });
  });

  it('user-disabled beats quiet hours', () => {
    const result = evaluate({
      ...base,
      type: 'MARKETING',
      datetime: within,
      quietHours: qh,
      userPreference: false,
      hasMatchingPolicy: false,
    });
    expect(result).toEqual({ decision: 'deny', reason: 'disabled_by_user_preference' });
  });

  it('quiet hours beats default-off', () => {
    const result = evaluate({
      ...base,
      type: 'MARKETING',
      datetime: within,
      quietHours: qh,
      userPreference: undefined,
      defaultEnabled: false,
    });
    expect(result).toEqual({ decision: 'deny', reason: 'quiet_hours' });
  });
});
