import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Channel } from '../../domain/types/channel';
import { NotificationType } from '../../domain/types/notification-type';
import { Region } from '../../domain/types/region';

/**
 * Persistence for global policies. Today only DENY policies exist, so the
 * lookup collapses to "does a deny rule match (type, channel, region)?".
 */
@Injectable()
export class PoliciesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async hasDenyPolicy(
    notificationType: NotificationType,
    channel: Channel,
    region: Region,
  ): Promise<boolean> {
    const policy = await this.prisma.globalPolicy.findUnique({
      where: {
        notificationType_channel_region: { notificationType, channel, region },
      },
    });
    return policy?.effect === 'DENY';
  }
}
