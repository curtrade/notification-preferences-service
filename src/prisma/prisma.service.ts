import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma client. One instance is shared across the app via the
 * global PrismaModule. Connects on module init and registers shutdown hooks
 * in main.ts so the pool drains cleanly on SIGTERM/SIGINT.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
