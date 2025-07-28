import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { DepreciationService } from '../services/depreciation.service';
import { CalculateDepreciationDto } from '../dto/calculate-depreciation.dto';
import { DepreciationResponseDto } from '../dto/depreciation-response.dto';

@ApiTags('depreciation')
@Controller('depreciation')
export class DepreciationController {
  constructor(private readonly depreciationService: DepreciationService) {}

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate asset depreciation',
    description: 'Calculate depreciation schedule for an asset using various methods',
  })
  @ApiResponse({
    status: 200,
    description: 'Depreciation calculated successfully',
    type: DepreciationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input parameters',
  })
  calculateDepreciation(
    @Body() calculateDepreciationDto: CalculateDepreciationDto,
  ): DepreciationResponseDto {
    return this.depreciationService.calculateDepreciation(calculateDepreciationDto);
  }
}