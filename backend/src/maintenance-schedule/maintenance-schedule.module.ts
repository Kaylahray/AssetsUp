import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { MaintenanceSchedule } from "./entities/maintenance-schedule.entity/maintenance-schedule.entity";
import { MaintenanceSchedulerController } from "./maintenance-schedule.controller";
import { MaintenanceScheduleService } from "./maintenance-schedule.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceSchedule]),
    ScheduleModule.forRoot(),
  ],
  controllers: [MaintenanceSchedulerController],
  providers: [MaintenanceScheduleService],
  exports: [MaintenanceScheduleService],
})
export class MaintenanceSchedulerModule {}
