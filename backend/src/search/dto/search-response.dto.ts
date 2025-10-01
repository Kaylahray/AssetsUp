import { ApiProperty } from '@nestjs/swagger';

export class SearchMetadata {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage: boolean;
}

export class SearchResponseDto<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty({ type: SearchMetadata })
  metadata: SearchMetadata;

  @ApiProperty({ 
    type: Object,
    example: { 
      category: 'Electronics', 
      department: 'IT Department' 
    }
  })
  appliedFilters: Record<string, any>;
}