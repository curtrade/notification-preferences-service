import { allow, deny } from '../../src/domain/types/decision';
import { quietHoursApplies } from '../../src/domain/types/notification-type';

describe('quietHoursApplies', () => {
  it('returns true for MARKETING', () => {
    expect(quietHoursApplies('MARKETING')).toBe(true);
  });

  it('returns false for TRANSACTIONAL', () => {
    expect(quietHoursApplies('TRANSACTIONAL')).toBe(false);
  });
});

describe('Decision helpers', () => {
  it('allow() has no reason', () => {
    expect(allow()).toEqual({ decision: 'allow' });
  });

  it('deny() carries the reason', () => {
    expect(deny('quiet_hours')).toEqual({ decision: 'deny', reason: 'quiet_hours' });
  });
});
