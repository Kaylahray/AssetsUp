import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, Between, LessThanOrEqual } from "typeorm"
import { MaintenanceSchedule, MaintenancePriority } from "../entities/maintenance-schedule.entity"
import type { NotificationService } from "./notification.service"

@Injectable()
export class MaintenanceTaskService {
  private readonly logger = new Logger(MaintenanceTaskService.name);

  constructor(
    private readonly notificationService: NotificationService,
    @InjectRepository(MaintenanceSchedule)
    private readonly maintenanceRepository: Repository<MaintenanceSchedule>,
  ) {}

  async sendMaintenanceReminders(configuration: any = {}): Promise<any> {
    const {
      reminderDays = [7, 3, 1], // Days before due date to send reminders
      priorities = [MaintenancePriority.HIGH, MaintenancePriority.CRITICAL],
      notifyUsers = [],
    } = configuration

    const results = []

    for (const days of reminderDays) {
      const reminderDate = new Date()
      reminderDate.setDate(reminderDate.getDate() + days)

      const startOfDay = new Date(reminderDate)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(reminderDate)
      endOfDay.setHours(23, 59, 59, 999)

      const upcomingMaintenance = await this.maintenanceRepository.find({
        where: {
          scheduledDate: Between(startOfDay, endOfDay),
          isCompleted: false,
          isActive: true,
          priority: priorities.length > 0 ? priorities[0] : MaintenancePriority.MEDIUM,
        },
      })

      this.logger.log(`Found ${upcomingMaintenance.length} maintenance items due in ${days} days`)

      if (upcomingMaintenance.length > 0) {
        // Send reminders
        for (const maintenance of upcomingMaintenance) {
          const recipients = maintenance.assignedTo ? [maintenance.assignedTo, ...notifyUsers] : notifyUsers

          for (const user of recipients) {
            await this.notificationService.sendMaintenanceReminder(user, maintenance, days)
          }
        }

        results.push({
          daysUntilDue: days,
          maintenanceCount: upcomingMaintenance.length,
          maintenanceItems: upcomingMaintenance.map((item) => ({
            id: item.id,
            title: item.title,
            assetId: item.assetId,
            scheduledDate: item.scheduledDate,
            priority: item.priority,
            assignedTo: item.assignedTo,
          })),
        })
      }
    }

    return {
      totalReminders: results.reduce((sum, r) => sum + r.maintenanceCount, 0),
      remindersByDays: results,
    }
  }

  async getUpcomingMaintenance(days = 30): Promise<MaintenanceSchedule[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    return this.maintenanceRepository.find({
      where: {
        scheduledDate: LessThanOrEqual(futureDate),
        isCompleted: false,
        isActive: true,
      },
      order: { scheduledDate: "ASC" },
    })
  }

  async getOverdueMaintenance(): Promise<MaintenanceSchedule[]> {
    return this.maintenanceRepository.find({
      where: {
        scheduledDate: LessThanOrEqual(new Date()),
        isCompleted: false,
        isActive: true,
      },
      order: { scheduledDate: "ASC" },
    })
  }

  async completeMaintenance(maintenanceId: string): Promise<MaintenanceSchedule> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id: maintenanceId },
    })

    if (maintenance) {
      maintenance.isCompleted = true
      maintenance.completedDate = new Date()
      return this.maintenanceRepository.save(maintenance)
    }

    return null
  }
}
