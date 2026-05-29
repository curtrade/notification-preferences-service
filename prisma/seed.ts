import { Channel, NotificationType, PolicyEffect, PrismaClient, Region } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Default preference matrix for new users.
 * - All TRANSACTIONAL channels default ON (users expect receipts, security, etc.).
 * - MARKETING email defaults OFF (matches the task example); other marketing
 *   channels default ON so the quiet-hours and global-policy scenarios are
 *   meaningful (something to suppress).
 */
const DEFAULTS: Array<{ notificationType: NotificationType; channel: Channel; enabled: boolean }> = [
  { notificationType: NotificationType.TRANSACTIONAL, channel: Channel.EMAIL, enabled: true },
  { notificationType: NotificationType.TRANSACTIONAL, channel: Channel.SMS, enabled: true },
  { notificationType: NotificationType.TRANSACTIONAL, channel: Channel.PUSH, enabled: true },
  { notificationType: NotificationType.TRANSACTIONAL, channel: Channel.MESSENGER, enabled: true },
  { notificationType: NotificationType.MARKETING, channel: Channel.EMAIL, enabled: false },
  { notificationType: NotificationType.MARKETING, channel: Channel.SMS, enabled: true },
  { notificationType: NotificationType.MARKETING, channel: Channel.PUSH, enabled: true },
  { notificationType: NotificationType.MARKETING, channel: Channel.MESSENGER, enabled: true },
];

/** Sample global policy: marketing SMS is forbidden in the EU. */
const GLOBAL_POLICIES: Array<{
  notificationType: NotificationType;
  channel: Channel;
  region: Region;
  effect: PolicyEffect;
}> = [
  {
    notificationType: NotificationType.MARKETING,
    channel: Channel.SMS,
    region: Region.EU,
    effect: PolicyEffect.DENY,
  },
];

async function main(): Promise<void> {
  // Upserts make seeding idempotent — re-running never duplicates rows.
  for (const d of DEFAULTS) {
    await prisma.notificationDefault.upsert({
      where: { notificationType_channel: { notificationType: d.notificationType, channel: d.channel } },
      update: { enabled: d.enabled },
      create: d,
    });
  }

  for (const p of GLOBAL_POLICIES) {
    await prisma.globalPolicy.upsert({
      where: {
        notificationType_channel_region: {
          notificationType: p.notificationType,
          channel: p.channel,
          region: p.region,
        },
      },
      update: { effect: p.effect },
      create: p,
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${DEFAULTS.length} defaults and ${GLOBAL_POLICIES.length} global policies.`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
