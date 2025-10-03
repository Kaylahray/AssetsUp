import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { CalculateRiskDto } from './dto/calculate-risk.dto';
import { RiskScoreResponse, RiskService } from './risk.service';

@Controller('risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Post('score')
  getRiskScore(
    @Body(new ValidationPipe()) details: CalculateRiskDto,
  ): RiskScoreResponse {
    return this.riskService.calculateRiskScore(details);
  }
}
