import { ApiProperty } from '@nestjs/swagger';
import { CHANNELS, Channel } from '../../../domain/types/channel';
import { NOTIFICATION_TYPES, NotificationType } from '../../../domain/types/notification-type';

export class ResolvedPreference {
  @ApiProperty({ enum: NOTIFICATION_TYPES, description: 'Категория уведомления.' })
  notificationType: NotificationType;

  @ApiProperty({ enum: CHANNELS, description: 'Канал доставки.' })
  channel: Channel;

  @ApiProperty({ description: 'Включена ли отправка для данной пары «тип + канал».' })
  enabled: boolean;

  @ApiProperty({
    enum: ['user', 'default'],
    description:
      'Источник значения: переопределение пользователя или системное значение по умолчанию.',
  })
  source: 'user' | 'default';
}

export class QuietHoursResponse {
  @ApiProperty({ description: 'Начало «тихих часов» в формате HH:mm.', example: '22:00' })
  startTime: string;

  @ApiProperty({ description: 'Окончание «тихих часов» в формате HH:mm.', example: '08:00' })
  endTime: string;

  @ApiProperty({ description: 'Часовой пояс IANA.', example: 'Europe/Moscow' })
  timezone: string;
}

export class PreferencesResponse {
  @ApiProperty({ description: 'Идентификатор пользователя.', example: 'user-42' })
  userId: string;

  @ApiProperty({
    type: [ResolvedPreference],
    description: 'Итоговые настройки по всем парам «тип + канал» с учётом значений по умолчанию.',
  })
  preferences: ResolvedPreference[];

  @ApiProperty({
    type: QuietHoursResponse,
    nullable: true,
    description: '«Тихие часы» пользователя или null, если не заданы.',
  })
  quietHours: QuietHoursResponse | null;
}
