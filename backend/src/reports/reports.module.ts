import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './services/reports.service';
import { ReportsController } from './reports.controller';
import { ReportGeneratorService } from './services/report-generator.service';

// --- ASSUMPTION ---
// Import your actual Asset entity here
class Asset {}
// --- END OF ASSUMPTION ---

@Module({
  imports: [TypeOrmModule.forFeature([Asset])],
  controllers: [ReportsController],
  providers: [ReportsService, ReportGeneratorService],
})
export class ReportsModule {}