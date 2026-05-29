import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  Matches,
  ValidateNested,
} from 'class-validator';
import { CHANNELS, Channel } from '../../../domain/types/channel';
import { NOTIFICATION_TYPES, NotificationType } from '../../../domain/types/notification-type';
import { IsTimeZone } from '../../../common/validation/is-timezone.validator';

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class PreferenceToggleDto {
  @IsIn(NOTIFICATION_TYPES)
  notificationType: NotificationType;

  @IsIn(CHANNELS)
  channel: Channel;

  @IsBoolean()
  enabled: boolean;
}

export class QuietHoursDto {
  @Matches(HHMM, { message: 'startTime must be HH:mm (00:00–23:59)' })
  startTime: string;

  @Matches(HHMM, { message: 'endTime must be HH:mm (00:00–23:59)' })
  endTime: string;

  @IsTimeZone()
  timezone: string;
}

/**
 * Body for POST /users/:id/preferences. Both fields are optional so callers can
 * toggle preferences, set quiet hours, or both in one idempotent request.
 */
export class UpdatePreferencesDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PreferenceToggleDto)
  preferences?: PreferenceToggleDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => QuietHoursDto)
  quietHours?: QuietHoursDto;
}
