import { Logger } from '@nestjs/common';
import { EvaluationService } from '../../src/modules/evaluation/evaluation.service';
import { PreferencesRepository } from '../../src/modules/preferences/preferences.repository';
import { PoliciesRepository } from '../../src/modules/policies/policies.repository';
import { EvaluateRequestDto } from '../../src/modules/evaluation/dto/evaluate-request.dto';

const baseRequest: EvaluateRequestDto = {
  userId: 'u1',
  notificationType: 'MARKETING',
  channel: 'EMAIL',
  region: 'US',
  datetime: '2026-01-15T22:30:00Z', // 23:30 Berlin — inside a 22:00–08:00 window
};

const makeService = (quietHoursRecord: unknown) => {
  const preferences = {
    findUserPreference: jest.fn().mockResolvedValue(undefined),
    findDefault: jest.fn().mockResolvedValue(true),
    getQuietHours: jest.fn().mockResolvedValue(quietHoursRecord),
  } as unknown as PreferencesRepository;
  const policies = {
    hasDenyPolicy: jest.fn().mockResolvedValue(false),
  } as unknown as PoliciesRepository;
  return new EvaluationService(preferences, policies);
};

describe('EvaluationService — corrupt stored quiet hours', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('ignores a malformed time and falls through to the default instead of throwing', async () => {
    const service = makeService({
      startTime: '99:99',
      endTime: '08:00',
      timezone: 'Europe/Berlin',
    });

    const result = await service.evaluate(baseRequest);

    expect(result).toEqual({ decision: 'allow' });
    expect(warn).toHaveBeenCalled();
  });

  it('ignores an invalid stored timezone without throwing', async () => {
    const service = makeService({ startTime: '22:00', endTime: '08:00', timezone: 'Not/AZone' });

    const result = await service.evaluate(baseRequest);

    expect(result).toEqual({ decision: 'allow' });
    expect(warn).toHaveBeenCalled();
  });

  it('still applies a well-formed window', async () => {
    const service = makeService({
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'Europe/Berlin',
    });

    const result = await service.evaluate(baseRequest);

    expect(result).toEqual({ decision: 'deny', reason: 'quiet_hours' });
    expect(warn).not.toHaveBeenCalled();
  });
});
