import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { PreferencesResponse } from './dto/preferences-response.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Controller('users/:id/preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  getPreferences(@Param('id') id: string): Promise<PreferencesResponse> {
    return this.preferencesService.getPreferences(id);
  }

  @Post()
  updatePreferences(
    @Param('id') id: string,
    @Body() dto: UpdatePreferencesDto,
  ): Promise<PreferencesResponse> {
    return this.preferencesService.updatePreferences(id, dto);
  }
}
