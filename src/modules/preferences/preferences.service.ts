import { Injectable, Logger } from '@nestjs/common';
import { QuietHours } from '../../domain/quiet-hours/quiet-hours';
import { Channel } from '../../domain/types/channel';
import { NotificationType } from '../../domain/types/notification-type';
import { PreferencesRepository } from './preferences.repository';
import { PreferencesResponse, ResolvedPreference } from './dto/preferences-response.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

const key = (type: NotificationType, channel: Channel): string => `${type}:${channel}`;

@Injectable()
export class PreferencesService {
  private readonly logger = new Logger(PreferencesService.name);

  constructor(private readonly repo: PreferencesRepository) {}

  /** Defaults merged with the user's overrides (overrides win), plus quiet hours. */
  async getPreferences(userId: string): Promise<PreferencesResponse> {
    const [defaults, userPrefs, quietHours] = await Promise.all([
      this.repo.getDefaults(),
      this.repo.getUserPreferences(userId),
      this.repo.getQuietHours(userId),
    ]);

    const merged = new Map<string, ResolvedPreference>();
    for (const d of defaults) {
      merged.set(key(d.notificationType, d.channel), {
        notificationType: d.notificationType,
        channel: d.channel,
        enabled: d.enabled,
        source: 'default',
      });
    }
    for (const u of userPrefs) {
      merged.set(key(u.notificationType, u.channel), {
        notificationType: u.notificationType,
        channel: u.channel,
        enabled: u.enabled,
        source: 'user',
      });
    }

    const preferences = [...merged.values()].sort((a, b) =>
      key(a.notificationType, a.channel).localeCompare(key(b.notificationType, b.channel)),
    );

    return { userId, preferences, quietHours };
  }

  /**
   * Apply preference toggles and/or quiet hours. Every write is an idempotent
   * upsert, so re-applying the same command leaves state unchanged. Returns the
   * resulting merged preferences so the caller sees the effect immediately.
   */
  async updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<PreferencesResponse> {
    for (const p of dto.preferences ?? []) {
      await this.repo.upsertPreference(userId, p.notificationType, p.channel, p.enabled);
      this.logger.log(
        `preference_changed user=${userId} type=${p.notificationType} channel=${p.channel} enabled=${p.enabled}`,
      );
      // metric: increment counter preferences_updated{type=p.notificationType, channel=p.channel}
    }

    if (dto.quietHours) {
      // Defense in depth: construct the value object to revalidate format/zone
      // beyond the DTO checks before persisting.
      new QuietHours(dto.quietHours.startTime, dto.quietHours.endTime, dto.quietHours.timezone);
      await this.repo.upsertQuietHours(userId, dto.quietHours);
      this.logger.log(
        `quiet_hours_changed user=${userId} window=${dto.quietHours.startTime}-${dto.quietHours.endTime} tz=${dto.quietHours.timezone}`,
      );
      // metric: increment counter quiet_hours_updated
    }

    return this.getPreferences(userId);
  }
}
