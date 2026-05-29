import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PreferencesService } from './preferences.service';
import { PreferencesResponse } from './dto/preferences-response.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@ApiTags('preferences')
@ApiParam({ name: 'id', description: 'Идентификатор пользователя.', example: 'user-42' })
@Controller('users/:id/preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить настройки пользователя',
    description: 'Возвращает итоговые настройки с учётом значений по умолчанию и «тихие часы».',
  })
  @ApiOkResponse({ description: 'Текущие настройки пользователя.', type: PreferencesResponse })
  getPreferences(@Param('id') id: string): Promise<PreferencesResponse> {
    return this.preferencesService.getPreferences(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Обновить настройки пользователя',
    description:
      'Идемпотентно обновляет переключатели настроек и/или «тихие часы». ' +
      'Возвращает итоговое состояние настроек после применения изменений.',
  })
  @ApiOkResponse({
    description: 'Настройки после применения изменений.',
    type: PreferencesResponse,
  })
  @ApiBadRequestResponse({ description: 'Тело запроса не прошло валидацию.' })
  updatePreferences(
    @Param('id') id: string,
    @Body() dto: UpdatePreferencesDto,
  ): Promise<PreferencesResponse> {
    return this.preferencesService.updatePreferences(id, dto);
  }
}
