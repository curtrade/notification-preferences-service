import { Module } from '@nestjs/common';
import { ConfigifyModule } from '@itgorillaz/configify';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigifyModule.forRootAsync(),
    PrismaModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
