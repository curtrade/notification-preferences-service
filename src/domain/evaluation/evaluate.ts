import { allow, deny, Decision } from '../types/decision';
import { quietHoursApplies } from '../types/notification-type';
import { EvaluationInput } from './evaluation-input';

/**
 * Pure decision engine. Layers are applied in the confirmed precedence order
 * — global policy → user → quiet hours → default — and the first deny wins:
 *
 *   1. Global policy        -> blocked_by_global_policy (compliance hard-block)
 *   2. Explicit user "off"  -> disabled_by_user_preference
 *   3. Quiet hours (marketing only, within window) -> quiet_hours
 *   4. Effective state off  -> disabled_by_default
 *   5. otherwise            -> allow
 *
 * An explicit user "on" overrides a default "off" but is still subject to
 * quiet hours and global policy.
 */
export function evaluate(input: EvaluationInput): Decision {
  // 1. Global policy — wins over everything.
  if (input.hasMatchingPolicy) {
    return deny('blocked_by_global_policy');
  }

  // 2. Explicit user opt-out.
  if (input.userPreference === false) {
    return deny('disabled_by_user_preference');
  }

  // 3. Quiet hours — only for affected types, when a window is set and active.
  if (
    quietHoursApplies(input.type) &&
    input.quietHours !== undefined &&
    input.quietHours.isWithin(input.datetime)
  ) {
    return deny('quiet_hours');
  }

  // 4. Fall back to the default when the user has no explicit preference.
  const effectiveEnabled = input.userPreference ?? input.defaultEnabled;
  if (!effectiveEnabled) {
    return deny('disabled_by_default');
  }

  return allow();
}
