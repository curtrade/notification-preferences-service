import { Module } from '@nestjs/common';
import { ConfigifyModule } from '@itgorillaz/configify';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { EvaluationModule } from './modules/evaluation/evaluation.module';

@Module({
  imports: [ConfigifyModule.forRootAsync(), PrismaModule, PreferencesModule, EvaluationModule],
  controllers: [HealthController],
})
export class AppModule {}
