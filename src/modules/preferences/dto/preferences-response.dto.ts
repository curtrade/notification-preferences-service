import { Channel } from '../../../domain/types/channel';
import { NotificationType } from '../../../domain/types/notification-type';

export interface ResolvedPreference {
  notificationType: NotificationType;
  channel: Channel;
  enabled: boolean;
  /** Where this value came from: the user's override or the system default. */
  source: 'user' | 'default';
}

export interface PreferencesResponse {
  userId: string;
  preferences: ResolvedPreference[];
  quietHours: {
    startTime: string;
    endTime: string;
    timezone: string;
  } | null;
}
