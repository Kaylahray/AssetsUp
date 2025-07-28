import { ApiProperty } from '@nestjs/swagger';

export class DepreciationCalculationResultDto {
  @ApiProperty({ description: 'Year number', example: 1 })
  year: number;

  @ApiProperty({ description: 'Book value at the beginning of the year', example: 100000 })
  beginningBookValue: number;

  @ApiProperty({ description: 'Depreciation expense for the year', example: 18000 })
  depreciationExpense: number;

  @ApiProperty({ description: 'Accumulated depreciation to date', example: 18000 })
  accumulatedDepreciation: number;

  @ApiProperty({ description: 'Book value at the end of the year', example: 82000 })
  endingBookValue: number;
}

export class DepreciationResponseDto {
  @ApiProperty({ description: 'Asset identifier', example: 'asset-001' })
  assetId: string;

  @ApiProperty({ description: 'Asset name', example: 'Manufacturing Equipment' })
  assetName: string;

  @ApiProperty({ description: 'Depreciation method used', example: 'straight-line' })
  method: string;

  @ApiProperty({ description: 'Initial cost of the asset', example: 100000 })
  initialCost: number;

  @ApiProperty({ description: 'Residual value of the asset', example: 10000 })
  residualValue: number;

  @ApiProperty({ description: 'Useful life in years', example: 5 })
  usefulLife: number;

  @ApiProperty({ description: 'Total depreciation over useful life', example: 90000 })
  totalDepreciation: number;

  @ApiProperty({
    description: 'Year-by-year depreciation schedule',
    type: [DepreciationCalculationResultDto],
  })
  schedule: DepreciationCalculationResultDto[];
}