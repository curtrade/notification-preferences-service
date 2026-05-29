import { QuietHours } from '../../src/domain/quiet-hours/quiet-hours';

describe('QuietHours.isWithin', () => {
  const at = (iso: string): Date => new Date(iso);

  describe('wrap-around window 22:00–08:00 Europe/Berlin', () => {
    const qh = new QuietHours('22:00', '08:00', 'Europe/Berlin');

    it('is within at 23:30 local (Berlin is UTC+1 in winter -> 22:30Z)', () => {
      // 2026-01-15T22:30:00Z === 23:30 local in Berlin (CET, +1)
      expect(qh.isWithin(at('2026-01-15T22:30:00Z'))).toBe(true);
    });

    it('is outside at 09:00 local', () => {
      // 08:00Z === 09:00 local Berlin (winter)
      expect(qh.isWithin(at('2026-01-15T08:00:00Z'))).toBe(false);
    });

    it('is within exactly at start 22:00 local (inclusive start)', () => {
      // 21:00Z === 22:00 local Berlin (winter)
      expect(qh.isWithin(at('2026-01-15T21:00:00Z'))).toBe(true);
    });

    it('is outside exactly at end 08:00 local (exclusive end)', () => {
      // 07:00Z === 08:00 local Berlin (winter)
      expect(qh.isWithin(at('2026-01-15T07:00:00Z'))).toBe(false);
    });

    it('is within just before end at 07:59 local', () => {
      // 06:59Z === 07:59 local Berlin (winter)
      expect(qh.isWithin(at('2026-01-15T06:59:00Z'))).toBe(true);
    });
  });

  describe('same-day window 13:00–14:00 UTC', () => {
    const qh = new QuietHours('13:00', '14:00', 'UTC');

    it('is within at 13:30', () => {
      expect(qh.isWithin(at('2026-05-21T13:30:00Z'))).toBe(true);
    });

    it('is outside at 12:59', () => {
      expect(qh.isWithin(at('2026-05-21T12:59:00Z'))).toBe(false);
    });

    it('is outside at 14:00 (exclusive end)', () => {
      expect(qh.isWithin(at('2026-05-21T14:00:00Z'))).toBe(false);
    });
  });

  describe('timezone correctness', () => {
    it('evaluates the same instant differently across zones', () => {
      const berlin = new QuietHours('22:00', '08:00', 'Europe/Berlin');
      const tokyo = new QuietHours('22:00', '08:00', 'Asia/Tokyo');
      const instant = at('2026-01-15T13:00:00Z'); // 14:00 Berlin, 22:00 Tokyo
      expect(berlin.isWithin(instant)).toBe(false);
      expect(tokyo.isWithin(instant)).toBe(true);
    });

    it('handles summer DST offset (Berlin +2 in July)', () => {
      const qh = new QuietHours('22:00', '08:00', 'Europe/Berlin');
      // 20:30Z === 22:30 local Berlin in July (CEST, +2) -> within
      expect(qh.isWithin(at('2026-07-15T20:30:00Z'))).toBe(true);
      // 21:30Z === 23:30 local in winter would be within, but in July 21:30Z = 23:30 too; pick a daytime case:
      // 10:00Z === 12:00 local July -> outside
      expect(qh.isWithin(at('2026-07-15T10:00:00Z'))).toBe(false);
    });
  });

  describe('validation', () => {
    it('throws on an invalid timezone', () => {
      const qh = new QuietHours('22:00', '08:00', 'Not/AZone');
      expect(() => qh.isWithin(at('2026-01-15T22:30:00Z'))).toThrow();
    });

    it('throws on a malformed time string', () => {
      expect(() => new QuietHours('25:00', '08:00', 'UTC')).toThrow();
    });
  });
});
