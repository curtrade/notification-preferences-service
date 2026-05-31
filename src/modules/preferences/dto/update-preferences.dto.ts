import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import { IsUniqueBy } from '../../../common/validation/is-unique-by.validator';
import { HHMM } from '../../../domain/quiet-hours/quiet-hours';

export class PreferenceToggleDto {
  @ApiProperty({ enum: NOTIFICATION_TYPES, description: 'Категория уведомления.' })
  @IsIn(NOTIFICATION_TYPES)
  notificationType: NotificationType;

  @ApiProperty({ enum: CHANNELS, description: 'Канал доставки.' })
  @IsIn(CHANNELS)
  channel: Channel;

  @ApiProperty({ description: 'Включить или выключить отправку для этой пары.' })
  @IsBoolean()
  enabled: boolean;
}

export class QuietHoursDto {
  @ApiProperty({ description: 'Начало «тихих часов» в формате HH:mm.', example: '22:00' })
  @Matches(HHMM, { message: 'startTime must be HH:mm (00:00–23:59)' })
  startTime: string;

  @ApiProperty({ description: 'Окончание «тихих часов» в формате HH:mm.', example: '08:00' })
  @Matches(HHMM, { message: 'endTime must be HH:mm (00:00–23:59)' })
  endTime: string;

  @ApiProperty({ description: 'Часовой пояс IANA.', example: 'Europe/Moscow' })
  @IsTimeZone()
  timezone: string;
}

/**
 * Body for POST /users/:id/preferences. Both fields are optional so callers can
 * toggle preferences, set quiet hours, or both in one idempotent request.
 */
export class UpdatePreferencesDto {
  @ApiPropertyOptional({
    type: [PreferenceToggleDto],
    description: 'Переключатели настроек. Должен содержать хотя бы один элемент, если передан.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUniqueBy<PreferenceToggleDto>(['notificationType', 'channel'], {
    message: 'preferences must not contain duplicate (notificationType, channel) pairs',
  })
  @ValidateNested({ each: true })
  @Type(() => PreferenceToggleDto)
  preferences?: PreferenceToggleDto[];

  @ApiPropertyOptional({ type: QuietHoursDto, description: '«Тихие часы» пользователя.' })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuietHoursDto)
  quietHours?: QuietHoursDto;
}
