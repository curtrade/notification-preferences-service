import { Module } from '@nestjs/common';
import { PreferencesModule } from '../preferences/preferences.module';
import { PoliciesModule } from '../policies/policies.module';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';

@Module({
  imports: [PreferencesModule, PoliciesModule],
  controllers: [EvaluationController],
  providers: [EvaluationService],
})
export class EvaluationModule {}
