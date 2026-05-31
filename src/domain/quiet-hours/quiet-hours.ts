import { DateTime, IANAZone } from 'luxon';

/** HH:mm (00:00–23:59) — the canonical local-time format for quiet hours. */
export const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * A user's quiet-hours window, expressed in their local time plus an IANA
 * timezone. Pure domain value object — the only dependency is Luxon for
 * timezone-correct (DST-aware) conversion.
 *
 * Window semantics: inclusive start, exclusive end. A window where start > end
 * (e.g. 22:00–08:00) wraps across midnight.
 */
export class QuietHours {
  private readonly startMinutes: number;
  private readonly endMinutes: number;

  constructor(
    readonly startTime: string,
    readonly endTime: string,
    readonly timezone: string,
  ) {
    this.startMinutes = QuietHours.toMinutes(startTime);
    this.endMinutes = QuietHours.toMinutes(endTime);
  }

  /**
   * Lenient factory for data already persisted in the database. Returns null
   * instead of throwing when the stored window is malformed (bad HH:mm or an
   * unknown timezone), so a single corrupt row can't turn every evaluation into
   * an HTTP 500. Validating the zone up front also guarantees isWithin won't
   * throw later. Callers should log the null case.
   */
  static parse(startTime: string, endTime: string, timezone: string): QuietHours | null {
    if (!HHMM.test(startTime) || !HHMM.test(endTime) || !IANAZone.isValidZone(timezone)) {
      return null;
    }
    return new QuietHours(startTime, endTime, timezone);
  }

  /** True if the given instant falls inside the quiet-hours window. */
  isWithin(instant: Date): boolean {
    const local = DateTime.fromJSDate(instant, { zone: this.timezone });
    if (!local.isValid) {
      throw new Error(`Invalid timezone: ${this.timezone} (${local.invalidReason ?? 'unknown'})`);
    }

    const minutes = local.hour * 60 + local.minute;

    if (this.startMinutes === this.endMinutes) {
      // Degenerate empty window — never within.
      return false;
    }
    if (this.startMinutes < this.endMinutes) {
      // Same-day window.
      return minutes >= this.startMinutes && minutes < this.endMinutes;
    }
    // Window wraps past midnight.
    return minutes >= this.startMinutes || minutes < this.endMinutes;
  }

  private static toMinutes(hhmm: string): number {
    const match = HHMM.exec(hhmm);
    if (!match) {
      throw new Error(`Invalid time "${hhmm}", expected HH:mm (00:00–23:59)`);
    }
    return Number(match[1]) * 60 + Number(match[2]);
  }
}
