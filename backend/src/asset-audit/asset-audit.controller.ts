import { Controller, Get, Post, Patch, Delete, Query, Param, Body } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from "@nestjs/swagger"
import type { AssetAuditService } from "./asset-audit.service"
import { CreateAssetAuditDto } from "./dto/create-asset-audit.dto"
import  { UpdateAssetAuditDto } from "./dto/update-asset-audit.dto"
import type { AuditReportQueryDto } from "./dto/audit-report.dto"
import type { AssetCondition } from "./entities/asset-audit.entity"
import { AssetAuditReportDto } from "./dto/audit-report.dto"

@ApiTags('Asset Audits')
@Controller("asset-audits")
export class AssetAuditController {
  constructor(private readonly assetAuditService: AssetAuditService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new asset audit' })
  @ApiResponse({ status: 201, description: 'Asset audit created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({ type: CreateAssetAuditDto })
  create(@Body() createAssetAuditDto: CreateAssetAuditDto) {
    return this.assetAuditService.create(createAssetAuditDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all asset audits with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'List of asset audits retrieved successfully' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? Number.parseInt(page, 10) : 1
    const limitNum = limit ? Number.parseInt(limit, 10) : 10
    return this.assetAuditService.findAll(pageNum, limitNum)
  }

  @Get("reports")
  @ApiOperation({ summary: 'Generate comprehensive audit report' })
  @ApiResponse({ status: 200, description: 'Audit report generated successfully', type: AssetAuditReportDto })
  generateReport(@Query() query: AuditReportQueryDto) {
    return this.assetAuditService.generateReport(query)
  }

  @Get("overdue")
  @ApiOperation({ summary: 'Get overdue asset audits' })
  @ApiQuery({ name: 'daysPastDue', required: false, type: Number, description: 'Number of days past due' })
  @ApiResponse({ status: 200, description: 'Overdue audits retrieved successfully' })
  getOverdueAudits(@Query('daysPastDue') daysPastDue?: string) {
    const days = daysPastDue ? Number.parseInt(daysPastDue, 10) : 30
    return this.assetAuditService.getOverdueAudits(days)
  }

  @Get("date-range")
  @ApiOperation({ summary: 'Get audits within date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'End date (ISO format)' })
  @ApiResponse({ status: 200, description: 'Audits in date range retrieved successfully' })
  getAuditsByDateRange(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.assetAuditService.getAuditsByDateRange(startDate, endDate)
  }

  @Get("asset/:assetId")
  @ApiOperation({ summary: 'Get audits for specific asset' })
  @ApiParam({ name: 'assetId', type: String, description: 'Asset ID' })
  @ApiResponse({ status: 200, description: 'Asset audits retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  findByAsset(@Param('assetId') assetId: string) {
    return this.assetAuditService.findByAsset(assetId)
  }

  @Get(":id")
  @ApiOperation({ summary: 'Get audit by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Audit ID' })
  @ApiResponse({ status: 200, description: 'Audit retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Audit not found' })
  findOne(@Param('id') id: string) {
    return this.assetAuditService.findOne(id)
  }

  @Patch(":id")
  @ApiOperation({ summary: 'Update audit details' })
  @ApiParam({ name: 'id', type: String, description: 'Audit ID' })
  @ApiResponse({ status: 200, description: 'Audit updated successfully' })
  @ApiResponse({ status: 404, description: 'Audit not found' })
  @ApiBody({ type: UpdateAssetAuditDto })
  update(@Param('id') id: string, @Body() updateAssetAuditDto: UpdateAssetAuditDto) {
    return this.assetAuditService.update(id, updateAssetAuditDto)
  }

  @Patch(":id/complete")
  @ApiOperation({ summary: 'Complete an audit' })
  @ApiParam({ name: 'id', type: String, description: 'Audit ID' })
  @ApiQuery({ name: 'condition', required: true, description: 'Asset condition' })
  @ApiQuery({ name: 'remarks', required: false, type: String, description: 'Completion remarks' })
  @ApiResponse({ status: 200, description: 'Audit completed successfully' })
  @ApiResponse({ status: 404, description: 'Audit not found' })
  completeAudit(
    @Param('id') id: string, 
    @Query('condition') condition: AssetCondition, 
    @Query('remarks') remarks?: string
  ) {
    return this.assetAuditService.completeAudit(id, condition, remarks)
  }

  @Delete(":id")
  @ApiOperation({ summary: 'Delete an audit' })
  @ApiParam({ name: 'id', type: String, description: 'Audit ID' })
  @ApiResponse({ status: 200, description: 'Audit deleted successfully' })
  @ApiResponse({ status: 404, description: 'Audit not found' })
  remove(@Param('id') id: string) {
    return this.assetAuditService.remove(id)
  }
}