/**
 * The reasons a send can be denied. Stable, machine-readable strings returned
 * by the /evaluate API so callers can branch on them.
 */
export type DenyReason =
  | 'blocked_by_global_policy'
  | 'disabled_by_user_preference'
  | 'disabled_by_default'
  | 'quiet_hours';

/** Outcome of evaluating whether a notification may be sent. */
export type Decision =
  | { decision: 'allow' }
  | { decision: 'deny'; reason: DenyReason };

export const allow = (): Decision => ({ decision: 'allow' });

export const deny = (reason: DenyReason): Decision => ({ decision: 'deny', reason });
