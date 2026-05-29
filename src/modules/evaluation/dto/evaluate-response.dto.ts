import { ApiProperty } from '@nestjs/swagger';
import { DenyReason } from '../../../domain/types/decision';

const DENY_REASONS: DenyReason[] = [
  'blocked_by_global_policy',
  'disabled_by_user_preference',
  'disabled_by_default',
  'quiet_hours',
];

export class EvaluateResponse {
  @ApiProperty({
    enum: ['allow', 'deny'],
    description: 'Итог проверки: разрешена («allow») или запрещена («deny») отправка.',
    example: 'deny',
  })
  decision: 'allow' | 'deny';

  @ApiProperty({
    enum: DENY_REASONS,
    required: false,
    description: 'Машиночитаемая причина отказа. Присутствует только при decision = "deny".',
    example: 'quiet_hours',
  })
  reason?: DenyReason;
}
