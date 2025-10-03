import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResponseDto } from './dto/search-response.dto';
import { SearchResultDto } from './dto/search-result.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Global search across assets and inventory',
    description: 'Search and filter assets and inventory by multiple criteria with pagination and sorting'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results retrieved successfully',
    type: SearchResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
  })
  async search(
    @Query() searchQuery: SearchQueryDto,
  ): Promise<SearchResponseDto<SearchResultDto>> {
    return this.searchService.search(searchQuery);
  }

  @Get('filters')
  @ApiOperation({ 
    summary: 'Get available filter options',
    description: 'Returns unique values for categories, departments, suppliers, and locations'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Filter options retrieved successfully',
  })
  async getFilterOptions() {
    return this.searchService.getFilterOptions();
  }
}