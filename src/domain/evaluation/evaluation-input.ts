import { Channel } from '../types/channel';
import { NotificationType } from '../types/notification-type';
import { Region } from '../types/region';
import { QuietHours } from '../quiet-hours/quiet-hours';

/**
 * Everything the decision engine needs, already loaded by the caller.
 * The engine performs no I/O — this keeps it pure and exhaustively testable.
 */
export interface EvaluationInput {
  type: NotificationType;
  channel: Channel;
  region: Region;
  /** The instant the send is being attempted (UTC). */
  datetime: Date;
  /** The user's explicit setting for (type, channel), or undefined if none. */
  userPreference: boolean | undefined;
  /** The default for (type, channel). */
  defaultEnabled: boolean;
  /** The user's quiet hours, or undefined if not configured. */
  quietHours: QuietHours | undefined;
  /** Whether a global DENY policy matches (type, channel, region). */
  hasMatchingPolicy: boolean;
}
