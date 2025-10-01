import { ApiProperty } from '@nestjs/swagger';

export class DashboardMetricsDto {
  @ApiProperty({ description: 'Total number of assets', example: 150 })
  totalAssets: number;

  @ApiProperty({ description: 'Number of disposed assets', example: 15 })
  disposedAssets: number;

  @ApiProperty({ description: 'Total stock items count (sum of all inventory quantities)', example: 500 })
  totalStockItems: number;
}