import { Controller, Get, Query, Res, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './services/reports.service';
import { ReportGeneratorService } from './services/report-generator.service';
import { GenerateReportDto } from './dto/generate-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly generatorService: ReportGeneratorService,
  ) {}

  @Get('assets/csv')
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