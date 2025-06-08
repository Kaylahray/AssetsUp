import { Injectable, Logger } from "@nestjs/common"
import type { SchedulerRegistry } from "@nestjs/schedule"
import { CronJob } from "cron"
import { type ScheduledTask, TaskType } from "../entities/scheduled-task.entity"
import type { AssetTaskService } from "./asset-task.service"
import type { MaintenanceTaskService } from "./maintenance-task.service"
import type { InventoryTaskService } from "./inventory-task.service"
import { ExecutionStatus } from "../entities/task-execution.entity"

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name)

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly assetTaskService: AssetTaskService,
    private readonly maintenanceTaskService: MaintenanceTaskService,
    private readonly inventoryTaskService: InventoryTaskService,
  ) {}

  async registerTask(task: ScheduledTask): Promise<void> {
    try {
      const job = new CronJob(task.cronExpression, async () => {
        await this.executeTask(task)
      })

      this.schedulerRegistry.addCronJob(task.id, job)
      job.start()

      this.logger.log(`Registered task: ${task.name} (${task.id})`)
    } catch (error) {
      this.logger.error(`Failed to register task ${task.id}:`, error)
      throw error
    }
  }

  async unregisterTask(taskId: string): Promise<void> {
    try {
      if (this.schedulerRegistry.doesExist("cron", taskId)) {
        this.schedulerRegistry.deleteCronJob(taskId)
        this.logger.log(`Unregistered task: ${taskId}`)
      }
    } catch (error) {
      this.logger.error(`Failed to unregister task ${taskId}:`, error)
    }
  }

  private async executeTask(task: ScheduledTask): Promise<void> {
    const startTime = new Date()
    this.logger.log(`Executing task: ${task.name} (${task.id})`)

    try {
      let result: any

      switch (task.type) {
        case TaskType.OVERDUE_ASSET_DETECTION:
          result = await this.assetTaskService.detectOverdueAssets(task.configuration)
          break
        case TaskType.MAINTENANCE_REMINDER:
          result = await this.maintenanceTaskService.sendMaintenanceReminders(task.configuration)
          break
        case TaskType.LOW_STOCK_DETECTION:
          result = await this.inventoryTaskService.detectLowStock(task.configuration)
          break
        default:
          throw new Error(`Unknown task type: ${task.type}`)
      }

      // Record successful execution
      await this.recordTaskExecution(task.id, {
        status: ExecutionStatus.SUCCESS,
        startedAt: startTime,
        completedAt: new Date(),
        output: JSON.stringify(result),
        metadata: { executionTime: Date.now() - startTime.getTime() },
      })

      this.logger.log(`Task completed successfully: ${task.name}`)
    } catch (error) {
      // Record failed execution
      await this.recordTaskExecution(task.id, {
        status: ExecutionStatus.FAILED,
        startedAt: startTime,
        completedAt: new Date(),
        errorMessage: error.message,
        metadata: { executionTime: Date.now() - startTime.getTime() },
      })

      this.logger.error(`Task failed: ${task.name}`, error)
    }
  }

  private async recordTaskExecution(taskId: string, executionData: any): Promise<void> {
    // This would typically inject TaskService, but to avoid circular dependency,
    // we'll emit an event or use a different approach
    // For now, we'll log the execution data
    this.logger.debug(`Task execution recorded for ${taskId}:`, executionData)
  }
}
