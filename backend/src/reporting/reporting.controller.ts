import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportingService } from './reporting.service';
import { ReportQueryDto } from './dto/report-query.dto';

@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get(':jurisdiction')
  async getReport(
    @Param('jurisdiction') jurisdiction: string,
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ) {
    const { format } = query;
    const stream = await this.reportingService.generateReport(
      jurisdiction,
      format,
    );
    const filename = `report-${jurisdiction.toLowerCase()}-${Date.now()}.${format}`;

    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else {
      res.setHeader('Content-Type', 'text/csv');
    }

    stream.pipe(res);
  }
}
