import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ScheduleModule } from "@nestjs/schedule"
import { MaintenanceService } from "./maintenance.service"
import { MaintenanceController, AssetMaintenanceController } from "./maintenance.controller"
import { Maintenance } from "./entities/maintenance.entity"
import { NotificationService } from "../notifications/notification.service"

@Module({
  imports: [TypeOrmModule.forFeature([Maintenance]), ScheduleModule.forRoot()],
  controllers: [MaintenanceController, AssetMaintenanceController],
  providers: [MaintenanceService, NotificationService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
