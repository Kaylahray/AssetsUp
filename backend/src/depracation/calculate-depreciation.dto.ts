mport { IsString, IsNumber, IsEnum, IsOptional, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DepreciationMethod } from '../enums/depreciation-method.enum';

export class CalculateDepreciationDto {
  @ApiProperty({
    description: 'Unique identifier for the asset',
    example: 'asset-001',
  })
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @ApiProperty({
    description: 'Name of the asset',
    example: 'Manufacturing Equipment',
  })
  @IsString()
  @IsNotEmpty()
  assetName: string;

  @ApiProperty({
    description: 'Initial cost of the asset',
    example: 100000,
    minimum: 0,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0, { message: 'Initial cost must be greater than or equal to 0' })
  initialCost: number;

  @ApiProperty({
    description: 'Residual value of the asset at the end of its useful life',
    example: 10000,
    minimum: 0,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0, { message: 'Residual value must be greater than or equal to 0' })
  residualValue: number;

  @ApiProperty({
    description: 'Useful life of the asset in years',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(1, { message: 'Useful life must be at least 1 year' })
  usefulLife: number;

  @ApiProperty({
    description: 'Depreciation method to use',
    enum: DepreciationMethod,
    example: DepreciationMethod.STRAIGHT_LINE,
  })
  @IsEnum(DepreciationMethod)
  method: DepreciationMethod;

  @ApiProperty({
    description: 'Depreciation rate for declining balance method (as decimal, e.g., 0.2 for 20%)',
    example: 0.2,
    required: false,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0, { message: 'Depreciation rate must be between 0 and 1' })
  depreciationRate?: number;
}