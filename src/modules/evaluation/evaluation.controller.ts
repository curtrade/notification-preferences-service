import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { EvaluateRequestDto } from './dto/evaluate-request.dto';
import { EvaluateResponse } from './dto/evaluate-response.dto';

@Controller('evaluate')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  evaluate(@Body() dto: EvaluateRequestDto): Promise<EvaluateResponse> {
    return this.evaluationService.evaluate(dto);
  }
}
