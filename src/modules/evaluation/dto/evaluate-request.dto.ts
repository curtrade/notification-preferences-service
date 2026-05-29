import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsNotEmpty, IsString } from 'class-validator';
import { CHANNELS, Channel } from '../../../domain/types/channel';
import { NOTIFICATION_TYPES, NotificationType } from '../../../domain/types/notification-type';
import { REGIONS, Region } from '../../../domain/types/region';

export class EvaluateRequestDto {
  @ApiProperty({ description: 'Идентификатор пользователя.', example: 'user-42' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: NOTIFICATION_TYPES, description: 'Категория уведомления.' })
  @IsIn(NOTIFICATION_TYPES)
  notificationType: NotificationType;

  @ApiProperty({ enum: CHANNELS, description: 'Канал доставки.' })
  @IsIn(CHANNELS)
  channel: Channel;

  @ApiProperty({ enum: REGIONS, description: 'Регион пользователя (для глобальных политик).' })
  @IsIn(REGIONS)
  region: Region;

  @ApiProperty({
    description: 'Момент времени в формате ISO-8601.',
    example: '2026-05-21T21:30:00Z',
  })
  @IsISO8601()
  datetime: string;
}
