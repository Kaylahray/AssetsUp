import { Controller, Get, Query, Res, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './services/reports.service';
import { ReportGeneratorService } from './services/report-generator.service';
import { GenerateReportDto } from './dto/generate-report.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly generatorService: ReportGeneratorService,
  ) {}

  @Get('assets/csv')
  @ApiOperation({ summary: 'Generate asset report as CSV' })
  @ApiResponse({ status: 200, description: 'CSV report generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  async getAssetReportCsv(
    @Query(new ValidationPipe({ transform: true })) filters: GenerateReportDto,
    @Res() res: Response,
  ) {
    const data = await this.reportsService.getAssetReportData(filters);
    const buffer = await this.generatorService.generateCsv(data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=asset_report.csv');
    res.send(buffer);
  }

  @Get('assets/pdf')
  @ApiOperation({ summary: 'Generate asset report as PDF' })
  @ApiResponse({ status: 200, description: 'PDF report generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  async getAssetReportPdf(
    @Query(new ValidationPipe({ transform: true })) filters: GenerateReportDto,
    @Res() res: Response,
  ) {
    const data = await this.reportsService.getAssetReportData(filters);
    const buffer = await this.generatorService.generatePdf('Asset Report', data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=asset_report.pdf');
    res.send(buffer);
  }
}