import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdatePreferencesDto } from '../../src/modules/preferences/dto/update-preferences.dto';

const validateDto = (payload: unknown) => validate(plainToInstance(UpdatePreferencesDto, payload));

describe('UpdatePreferencesDto — duplicate preference toggles', () => {
  it('rejects duplicate (notificationType, channel) pairs', async () => {
    const errors = await validateDto({
      preferences: [
        { notificationType: 'MARKETING', channel: 'EMAIL', enabled: true },
        { notificationType: 'MARKETING', channel: 'EMAIL', enabled: false },
      ],
    });

    const prefError = errors.find((e) => e.property === 'preferences');
    expect(prefError?.constraints).toHaveProperty('isUniqueBy');
  });

  it('accepts distinct (type, channel) pairs', async () => {
    const errors = await validateDto({
      preferences: [
        { notificationType: 'MARKETING', channel: 'EMAIL', enabled: true },
        { notificationType: 'MARKETING', channel: 'SMS', enabled: false },
      ],
    });

    expect(errors).toHaveLength(0);
  });

  it('allows the same channel across different types', async () => {
    const errors = await validateDto({
      preferences: [
        { notificationType: 'MARKETING', channel: 'EMAIL', enabled: true },
        { notificationType: 'TRANSACTIONAL', channel: 'EMAIL', enabled: false },
      ],
    });

    expect(errors).toHaveLength(0);
  });
});
