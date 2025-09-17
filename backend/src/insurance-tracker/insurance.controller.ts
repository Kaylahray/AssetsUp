import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { InsuranceService } from './insurance.service';
import { CreateInsurancePolicyDto } from './dto/create-insurance-policy.dto';
import { UpdateInsurancePolicyDto } from './dto/update-insurance-policy.dto';
import { InsuranceQueryDto } from './dto/insurance-query.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@ApiTags('Insurance Tracker')
@Controller('insurance')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new insurance policy' })
  @ApiResponse({ status: 201, description: 'Insurance policy created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createInsurancePolicyDto: CreateInsurancePolicyDto) {
    return await this.insuranceService.create(createInsurancePolicyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all insurance policies with filtering and analytics' })
  @ApiResponse({ status: 200, description: 'Insurance policies retrieved successfully' })
  async findAll(@Query() queryDto: InsuranceQueryDto) {
    return await this.insuranceService.findAll(queryDto);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get insurance policy analytics and statistics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics() {
    return await this.insuranceService.getPolicyAnalytics();
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get insurance policies expiring within specified days' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days (default: 30)' })
  @ApiResponse({ status: 200, description: 'Expiring insurance policies retrieved successfully' })
  async findExpiring(@Query('days') days?: number) {
    return await this.insuranceService.findExpiring(days);
  }

  @Get('expired')
  @ApiOperation({ summary: 'Get expired insurance policies' })
  @ApiResponse({ status: 200, description: 'Expired insurance policies retrieved successfully' })
  async findExpired() {
    return await this.insuranceService.findExpired();
  }

  @Get('due-for-renewal')
  @ApiOperation({ summary: 'Get insurance policies due for renewal' })
  @ApiResponse({ status: 200, description: 'Policies due for renewal retrieved successfully' })
  async findDueForRenewal() {
    return await this.insuranceService.findDueForRenewal();
  }

  @Get('asset/:assetId')
  @ApiOperation({ summary: 'Get insurance policies by asset ID' })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiResponse({ status: 200, description: 'Asset insurance policies retrieved successfully' })
  async findByAsset(@Param('assetId') assetId: string) {
    return await this.insuranceService.findByAsset(assetId);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get insurance policies by asset category' })
  @ApiParam({ name: 'category', description: 'Asset category' })
  @ApiResponse({ status: 200, description: 'Category insurance policies retrieved successfully' })
  async findByCategory(@Param('category') category: string) {
    return await this.insuranceService.findByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get insurance policy by ID' })
  @ApiParam({ name: 'id', description: 'Insurance policy ID' })
  @ApiResponse({ status: 200, description: 'Insurance policy retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Insurance policy not found' })
  async findOne(@Param('id') id: string) {
    return await this.insuranceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update insurance policy' })
  @ApiParam({ name: 'id', description: 'Insurance policy ID' })
  @ApiResponse({ status: 200, description: 'Insurance policy updated successfully' })
  @ApiResponse({ status: 404, description: 'Insurance policy not found' })
  async update(@Param('id') id: string, @Body() updateInsurancePolicyDto: UpdateInsurancePolicyDto) {
    return await this.insuranceService.update(id, updateInsurancePolicyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete insurance policy' })
  @ApiParam({ name: 'id', description: 'Insurance policy ID' })
  @ApiResponse({ status: 204, description: 'Insurance policy deleted successfully' })
  @ApiResponse({ status: 404, description: 'Insurance policy not found' })
  async remove(@Param('id') id: string) {
    await this.insuranceService.remove(id);
  }

  @Patch(':id/renew')
  @ApiOperation({ summary: 'Renew insurance policy' })
  @ApiParam({ name: 'id', description: 'Insurance policy ID' })
  @ApiResponse({ status: 200, description: 'Insurance policy renewed successfully' })
  @ApiResponse({ status: 404, description: 'Insurance policy not found' })
  async renewPolicy(
    @Param('id') id: string,
    @Body() renewalData: { newCoverageEnd: string; newInsuredValue?: number },
  ) {
    return await this.insuranceService.renewPolicy(
      id,
      renewalData.newCoverageEnd,
      renewalData.newInsuredValue,
    );
  }

  // Document management endpoints
  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a document for an insurance policy' })
  @ApiParam({ name: 'id', description: 'Insurance policy ID' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async uploadDocument(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ 
            fileType: /(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt)$/ 
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadDocumentDto: UploadDocumentDto,
  ) {
    uploadDocumentDto.insurancePolicyId = id;
    return await this.insuranceService.uploadDocument(file, uploadDocumentDto);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get all documents for an insurance policy' })
  @ApiParam({ name: 'id', description: 'Insurance policy ID' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async getDocuments(@Param('id') id: string) {
    return await this.insuranceService.getDocuments(id);
  }

  @Delete('documents/:documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a policy document' })
  @ApiParam({ name: 'documentId', description: 'Document ID' })
  @ApiResponse({ status: 204, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async removeDocument(@Param('documentId') documentId: string) {
    await this.insuranceService.removeDocument(documentId);
  }
}
