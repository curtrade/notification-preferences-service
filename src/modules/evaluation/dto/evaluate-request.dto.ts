import { IsIn, IsISO8601, IsNotEmpty, IsString } from 'class-validator';
import { CHANNELS, Channel } from '../../../domain/types/channel';
import { NOTIFICATION_TYPES, NotificationType } from '../../../domain/types/notification-type';
import { REGIONS, Region } from '../../../domain/types/region';

export class EvaluateRequestDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsIn(NOTIFICATION_TYPES)
  notificationType: NotificationType;

  @IsIn(CHANNELS)
  channel: Channel;

  @IsIn(REGIONS)
  region: Region;

  /** ISO-8601 instant, e.g. "2026-05-21T21:30:00Z". */
  @IsISO8601()
  datetime: string;
}
