/**
 * Notification categories. TRANSACTIONAL messages (receipts, security, etc.)
 * bypass quiet hours; MARKETING messages are subject to them.
 */
export const NOTIFICATION_TYPES = ['TRANSACTIONAL', 'MARKETING'] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/**
 * Whether a notification type is suppressed during a user's quiet hours.
 * Transactional notifications are considered important enough to always deliver.
 */
export function quietHoursApplies(type: NotificationType): boolean {
  return type === 'MARKETING';
}
