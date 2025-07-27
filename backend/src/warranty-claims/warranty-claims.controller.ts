import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFiles,
  UseInterceptors,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { WarrantyClaimsService } from './warranty-claims.service';
import { CreateWarrantyClaimDto } from './dto/create-warranty-claim.dto';
import { UpdateWarrantyClaimDto } from './dto/update-warranty-claim.dto';
import { WarrantyClaimQueryDto } from './dto/warranty-claim-query.dto';
import { WarrantyClaim } from './entities/warranty-claim.entity';
import { WarrantyClaimStatus } from './enums/warranty-claim-status.enum';
import { FileUpload } from '../common/decorators/file-upload.decorator';

@ApiTags('warranty-claims')
@Controller('warranty-claims')
export class WarrantyClaimsController {
  constructor(private readonly warrantyClaimsService: WarrantyClaimsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new warranty claim' })
  @ApiResponse({ status: 201, description: 'Warranty claim created successfully', type: WarrantyClaim })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createWarrantyClaimDto: CreateWarrantyClaimDto): Promise<WarrantyClaim> {
    return this.warrantyClaimsService.create(createWarrantyClaimDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all warranty claims with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of warranty claims' })
  findAll(@Query() queryDto: WarrantyClaimQueryDto) {
    return this.warrantyClaimsService.findAll(queryDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get warranty claim statistics by status' })
  @ApiResponse({ status: 200, description: 'Warranty claim statistics' })
  getStatistics() {
    return this.warrantyClaimsService.getClaimStatistics();
  }

  @Get(':claimId')
  @ApiOperation({ summary: 'Get a warranty claim by ID' })
  @ApiParam({ name: 'claimId', description: 'Warranty claim UUID' })
  @ApiResponse({ status: 200, description: 'Warranty claim found', type: WarrantyClaim })
  @ApiResponse({ status: 404, description: 'Warranty claim not found' })
  findOne(@Param('claimId', ParseUUIDPipe) claimId: string): Promise<WarrantyClaim> {
    return this.warrantyClaimsService.findOne(claimId);
  }

  @Patch(':claimId')
  @ApiOperation({ summary: 'Update a warranty claim' })
  @ApiParam({ name: 'claimId', description: 'Warranty claim UUID' })
  @ApiResponse({ status: 200, description: 'Warranty claim updated', type: WarrantyClaim })
  @ApiResponse({ status: 404, description: 'Warranty claim not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('claimId', ParseUUIDPipe) claimId: string,
    @Body() updateWarrantyClaimDto: UpdateWarrantyClaimDto,
  ): Promise<WarrantyClaim> {
    return this.warrantyClaimsService.update(claimId, updateWarrantyClaimDto);
  }

  @Delete(':claimId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a warranty claim' })
  @ApiParam({ name: 'claimId', description: 'Warranty claim UUID' })
  @ApiResponse({ status: 204, description: 'Warranty claim deleted' })
  @ApiResponse({ status: 404, description: 'Warranty claim not found' })
  remove(@Param('claimId', ParseUUIDPipe) claimId: string): Promise<void> {
    return this.warrantyClaimsService.remove(claimId);
  }

  @Post(':claimId/documents')
  @FileUpload('files', 10)
  @ApiOperation({ summary: 'Upload supporting documents for a warranty claim' })
  @ApiParam({ name: 'claimId', description: 'Warranty claim UUID' })
  @ApiResponse({ status: 200, description: 'Documents uploaded successfully' })
  @ApiResponse({ status: 404, description: 'Warranty claim not found' })
  async uploadDocuments(
    @Param('claimId', ParseUUIDPipe) claimId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<WarrantyClaim> {
    const filePaths = files.map(file => file.path);
    return this.warrantyClaimsService.addSupportingDocuments(claimId, filePaths);
  }

  @Patch(':claimId/status')
  @ApiOperation({ summary: 'Update warranty claim status' })
  @ApiParam({ name: 'claimId', description: 'Warranty claim UUID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Warranty claim not found' })
  updateStatus(
    @Param('claimId', ParseUUIDPipe) claimId: string,
    @Body() body: { status: WarrantyClaimStatus; resolutionNotes?: string },
  ): Promise<WarrantyClaim> {
    return this.warrantyClaimsService.updateStatus(claimId, body.status, body.resolutionNotes);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get warranty claims by status' })
  @ApiParam({ name: 'status', enum: WarrantyClaimStatus })
  @ApiResponse({ status: 200, description: 'List of warranty claims with specified status' })
  getClaimsByStatus(@Param('status') status: WarrantyClaimStatus): Promise<WarrantyClaim[]> {
    return this.warrantyClaimsService.getClaimsByStatus(status);
  }
}