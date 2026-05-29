import { Module } from '@nestjs/common';
import { PoliciesRepository } from './policies.repository';

@Module({
  providers: [PoliciesRepository],
  exports: [PoliciesRepository],
})
export class PoliciesModule {}
