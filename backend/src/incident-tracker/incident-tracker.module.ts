import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incident } from './entities/incident.entity';
import { IncidentTrackerService } from './incident-tracker.service';
import { IncidentTrackerController } from './incident-tracker.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Incident])],
  providers: [IncidentTrackerService],
  controllers: [IncidentTrackerController],
})
export class IncidentTrackerModule {} 