import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  async getQuietHours(userId: string): Promise<QuietHoursRecord | null> {
    const row = await this.prisma.userQuietHours.findUnique({ where: { userId } });
    if (!row) {
      return null;
    }
    return { startTime: row.startTime, endTime: row.endTime, timezone: row.timezone };
  }

  /**
   * Apply preference toggles and/or a quiet-hours window atomically. Every write
   * is an idempotent upsert and all of them run in a single transaction, so a
   * mid-batch failure leaves no partial state behind.
   */
  async applyUpdates(
    userId: string,
    preferences: PreferenceRecord[],
    quietHours?: QuietHoursRecord,
  ): Promise<void> {
    const ops: Prisma.PrismaPromise<unknown>[] = preferences.map((p) =>
      this.prisma.userPreference.upsert({
        where: {
          userId_notificationType_channel: {
            userId,
            notificationType: p.notificationType,
            channel: p.channel,
          },
        },
        update: { enabled: p.enabled },
        create: {
          userId,
          notificationType: p.notificationType,
          channel: p.channel,
          enabled: p.enabled,
        },
      }),
    );

    if (quietHours) {
      ops.push(
        this.prisma.userQuietHours.upsert({
          where: { userId },
          update: quietHours,
          create: { userId, ...quietHours },
        }),
      );
    }

    if (ops.length > 0) {
      await this.prisma.$transaction(ops);
    }
  }
}
