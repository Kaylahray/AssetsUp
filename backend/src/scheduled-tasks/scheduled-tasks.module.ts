import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ScheduleModule } from "@nestjs/schedule"
import { ScheduledTasksController } from "./controllers/scheduled-tasks.controller"
import { TaskService } from "./services/task.service"
import { SchedulingService } from "./services/scheduling.service"
import { AssetTaskService } from "./services/asset-task.service"
import { MaintenanceTaskService } from "./services/maintenance-task.service"
import { InventoryTaskService } from "./services/inventory-task.service"
import { NotificationService } from "./services/notification.service"
import { ScheduledTask } from "./entities/scheduled-task.entity"
import { Asset } from "./entities/asset.entity"
import { MaintenanceSchedule } from "./entities/maintenance-schedule.entity"
import { InventoryItem } from "./entities/inventory-item.entity"
import { TaskExecution } from "./entities/task-execution.entity"

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([ScheduledTask, Asset, MaintenanceSchedule, InventoryItem, TaskExecution]),
  ],
  controllers: [ScheduledTasksController],
  providers: [
    TaskService,
    SchedulingService,
    AssetTaskService,
    MaintenanceTaskService,
    InventoryTaskService,
    NotificationService,
  ],
  exports: [TaskService, SchedulingService, AssetTaskService, MaintenanceTaskService, InventoryTaskService],
})
export class ScheduledTasksModule {}
