import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSettingsDto {
  @ApiProperty({ description: 'Default currency for financial calculations', example: 'USD' })
  @IsString()
  defaultCurrency: string;

  @ApiProperty({ description: 'System timezone', example: 'America/New_York' })
  @IsString()
  timezone: string;

  @ApiProperty({ description: 'Default depreciation method for assets', example: 'straight-line' })
  @IsString()
  depreciationMethod: string;
}