import { ApiProperty } from '@nestjs/swagger';

export class SearchResultDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'asset', enum: ['asset', 'inventory'] })
  entityType: string;

  @ApiProperty({ example: 'Dell Laptop XPS 15' })
  name: string;

  @ApiProperty({ example: 'High-performance laptop for development' })
  description: string;

  @ApiProperty({ example: 'Electronics' })
  category: string;

  @ApiProperty({ example: 'IT Department' })
  department: string;

  @ApiProperty({ example: 'Tech Suppliers Inc' })
  supplier: string;

  @ApiProperty({ example: 'Warehouse A' })
  location: string;

  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  updatedAt: Date;
}