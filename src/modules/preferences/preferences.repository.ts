import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Channel } from '../../domain/types/channel';
import { NotificationType } from '../../domain/types/notification-type';

/** A single (type, channel, enabled) preference row, free of Prisma types. */
export interface PreferenceRecord {
  notificationType: NotificationType;
  channel: Channel;
  enabled: boolean;
}

/** Stored quiet-hours window, free of Prisma types. */
export interface QuietHoursRecord {
  startTime: string;
  endTime: string;
  timezone: string;
}

/**
 * Persistence for defaults, user preferences, and quiet hours. Maps Prisma rows
 * to plain domain-facing shapes so Prisma types never leak past this boundary.
 */
@Injectable()
export class PreferencesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDefaults(): Promise<PreferenceRecord[]> {
    const rows = await this.prisma.notificationDefault.findMany();
    return rows.map((r) => ({
      notificationType: r.notificationType,
      channel: r.channel,
      enabled: r.enabled,
    }));
  }

  async getUserPreferences(userId: string): Promise<PreferenceRecord[]> {
    const rows = await this.prisma.userPreference.findMany({ where: { userId } });
    return rows.map((r) => ({
      notificationType: r.notificationType,
      channel: r.channel,
      enabled: r.enabled,
    }));
  }

  /**
   * The default enabled-state for (type, channel). Falls back to false (deny)
   * when no default row exists for the combination.
   */
  async findDefault(notificationType: NotificationType, channel: Channel): Promise<boolean> {
    const row = await this.prisma.notificationDefault.findUnique({
      where: { notificationType_channel: { notificationType, channel } },
    });
    return row?.enabled ?? false;
  }

  /**
   * Look up a single user override for (type, channel). Returns the boolean
   * setting, or undefined when the user has no explicit preference.
   */
  async findUserPreference(
    userId: string,
    notificationType: NotificationType,
    channel: Channel,
  ): Promise<boolean | undefined> {
    const row = await this.prisma.userPreference.findUnique({
      where: { userId_notificationType_channel: { userId, notificationType, channel } },
    });
    return row?.enabled;
  }

  /** Idempotent upsert keyed on (userId, type, channel). */
  async upsertPreference(
    userId: string,
    notificationType: NotificationType,
    channel: Channel,
    enabled: boolean,
  ): Promise<void> {
    await this.prisma.userPreference.upsert({
      where: { userId_notificationType_channel: { userId, notificationType, channel } },
      update: { enabled },
      create: { userId, notificationType, channel, enabled },
    });
  }

  async getQuietHours(userId: string): Promise<QuietHoursRecord | null> {
    const row = await this.prisma.userQuietHours.findUnique({ where: { userId } });
    if (!row) {
      return null;
    }
    return { startTime: row.startTime, endTime: row.endTime, timezone: row.timezone };
  }

  /** Idempotent upsert of the user's single quiet-hours window. */
  async upsertQuietHours(userId: string, quietHours: QuietHoursRecord): Promise<void> {
    await this.prisma.userQuietHours.upsert({
      where: { userId },
      update: quietHours,
      create: { userId, ...quietHours },
    });
  }
}
