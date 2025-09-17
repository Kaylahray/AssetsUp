import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentReport } from './incident-report.entity';
import { IncidentReportingService } from './incident-reporting.service';
import { IncidentReportingController } from './incident-reporting.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([IncidentReport]), NotificationsModule],
  providers: [IncidentReportingService],
  controllers: [IncidentReportingController],
  exports: [IncidentReportingService],
})
export class IncidentReportingModule {}


