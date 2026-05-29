import { Module } from '@nestjs/common';
import { PreferencesController } from './preferences.controller';
import { PreferencesService } from './preferences.service';
import { PreferencesRepository } from './preferences.repository';

@Module({
  controllers: [PreferencesController],
  providers: [PreferencesService, PreferencesRepository],
  exports: [PreferencesRepository],
})
export class PreferencesModule {}
