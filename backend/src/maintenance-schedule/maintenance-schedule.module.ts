import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MaintenanceSchedule } from "./entities/maintenance-schedule.entity/maintenance-schedule.entity";
import { MaintenanceScheduleService } from "./maintenance-schedule.service";
import { MaintenanceScheduleController } from "./maintenance-schedule.controller";

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceSchedule])],
  providers: [MaintenanceScheduleService],
  controllers: [MaintenanceScheduleController],
})
export class MaintenanceScheduleModule {}
