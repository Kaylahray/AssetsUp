import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, Between, LessThan } from "typeorm"
import { Cron, CronExpression } from "@nestjs/schedule"
import { Maintenance, MaintenanceStatus } from "./entities/maintenance.entity"
import type { CreateMaintenanceDto } from "./dto/create-maintenance.dto"
import type { UpdateMaintenanceDto } from "./dto/update-maintenance.dto"
import type { MaintenanceFilterDto } from "./dto/maintenance-filter.dto"
import type { NotificationService } from "../notifications/notification.service"

@Injectable()
export class MaintenanceService {
  private maintenanceRepository: Repository<Maintenance>
  constructor(
    @InjectRepository(Maintenance)
    maintenanceRepository: Repository<Maintenance>,
    private notificationService: NotificationService,
  ) {
    this.maintenanceRepository = maintenanceRepository
  }

  async create(createMaintenanceDto: CreateMaintenanceDto): Promise<Maintenance> {
    const startDate = new Date(createMaintenanceDto.startDate)
    const dueDate = new Date(createMaintenanceDto.dueDate)

    if (dueDate <= startDate) {
      throw new BadRequestException("Due date must be after start date")
    }

    const maintenance = this.maintenanceRepository.create({
      ...createMaintenanceDto,
      startDate,
      dueDate,
    })

    const savedMaintenance = await this.maintenanceRepository.save(maintenance)

    // Schedule notification for upcoming maintenance
    await this.scheduleMaintenanceNotification(savedMaintenance)

    return this.findOne(savedMaintenance.id)
  }

  async findAll(filters?: MaintenanceFilterDto): Promise<Maintenance[]> {
    const query = this.maintenanceRepository
      .createQueryBuilder("maintenance")
      .leftJoinAndSelect("maintenance.asset", "asset")
      .leftJoinAndSelect("maintenance.responsiblePerson", "responsiblePerson")
      .leftJoinAndSelect("maintenance.vendor", "vendor")

    if (filters) {
      if (filters.assetId) {
        query.andWhere("maintenance.assetId = :assetId", {
          assetId: filters.assetId,
        })
      }

      if (filters.type) {
        query.andWhere("maintenance.type = :type", { type: filters.type })
      }

      if (filters.status) {
        query.andWhere("maintenance.status = :status", {
          status: filters.status,
        })
      }

      if (filters.startDate && filters.endDate) {
        query.andWhere("maintenance.dueDate BETWEEN :startDate AND :endDate", {
          startDate: filters.startDate,
          endDate: filters.endDate,
        })
      }

      if (filters.responsiblePersonId) {
        query.andWhere("maintenance.responsiblePersonId = :responsiblePersonId", {
          responsiblePersonId: filters.responsiblePersonId,
        })
      }

      if (filters.vendorId) {
        query.andWhere("maintenance.vendorId = :vendorId", {
          vendorId: filters.vendorId,
        })
      }
    }

    return query.orderBy("maintenance.dueDate", "ASC").getMany()
  }

  async findOne(id: string): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
      relations: ["asset", "responsiblePerson", "vendor"],
    })

    if (!maintenance) {
      throw new NotFoundException(`Maintenance record with ID ${id} not found`)
    }

    return maintenance
  }

  async update(id: string, updateMaintenanceDto: UpdateMaintenanceDto): Promise<Maintenance> {
    const maintenance = await this.findOne(id)

    // Handle status changes
    if (updateMaintenanceDto.status === MaintenanceStatus.COMPLETED) {
      updateMaintenanceDto.completionDate = new Date().toISOString()
    }

    // Validate date logic
    if (updateMaintenanceDto.startDate && updateMaintenanceDto.dueDate) {
      const startDate = new Date(updateMaintenanceDto.startDate)
      const dueDate = new Date(updateMaintenanceDto.dueDate)

      if (dueDate <= startDate) {
        throw new BadRequestException("Due date must be after start date")
      }
    }

    await this.maintenanceRepository.update(id, {
      ...updateMaintenanceDto,
      startDate: updateMaintenanceDto.startDate ? new Date(updateMaintenanceDto.startDate) : undefined,
      dueDate: updateMaintenanceDto.dueDate ? new Date(updateMaintenanceDto.dueDate) : undefined,
      completionDate: updateMaintenanceDto.completionDate ? new Date(updateMaintenanceDto.completionDate) : undefined,
    })

    return this.findOne(id)
  }

  async remove(id: string): Promise<void> {
    const maintenance = await this.findOne(id)
    await this.maintenanceRepository.remove(maintenance)
  }

  async getAssetMaintenanceHistory(assetId: string): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { assetId },
      relations: ["responsiblePerson", "vendor"],
      order: { dueDate: "DESC" },
    })
  }

  async markAsCompleted(id: string, actualHours?: number): Promise<Maintenance> {
    const updateData: Partial<Maintenance> = {
      status: MaintenanceStatus.COMPLETED,
      completionDate: new Date(),
    }

    if (actualHours !== undefined) {
      updateData.actualHours = actualHours
    }

    await this.maintenanceRepository.update(id, updateData)
    return this.findOne(id)
  }

  async getUpcomingMaintenance(days = 7): Promise<Maintenance[]> {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + days)

    return this.maintenanceRepository.find({
      where: {
        dueDate: Between(today, futureDate),
        status: MaintenanceStatus.SCHEDULED,
      },
      relations: ["asset", "responsiblePerson"],
    })
  }

  async getOverdueMaintenance(): Promise<Maintenance[]> {
    const today = new Date()

    return this.maintenanceRepository.find({
      where: {
        dueDate: LessThan(today),
        status: MaintenanceStatus.SCHEDULED,
      },
      relations: ["asset", "responsiblePerson"],
    })
  }

  // Cron job to check for overdue maintenance and send notifications
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkOverdueMaintenance(): Promise<void> {
    const overdueMaintenance = await this.getOverdueMaintenance()

    // Update status to overdue
    for (const maintenance of overdueMaintenance) {
      await this.maintenanceRepository.update(maintenance.id, {
        status: MaintenanceStatus.OVERDUE,
      })

      // Send overdue notification
      await this.notificationService.sendMaintenanceOverdueNotification(maintenance)
    }
  }

  // Cron job to send upcoming maintenance notifications
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendUpcomingMaintenanceNotifications(): Promise<void> {
    const upcomingMaintenance = await this.getUpcomingMaintenance(3) // 3 days ahead

    for (const maintenance of upcomingMaintenance) {
      await this.notificationService.sendUpcomingMaintenanceNotification(maintenance)
    }
  }

  private async scheduleMaintenanceNotification(maintenance: Maintenance): Promise<void> {
    // Send notification 3 days before due date
    const notificationDate = new Date(maintenance.dueDate)
    notificationDate.setDate(notificationDate.getDate() - 3)

    if (notificationDate > new Date()) {
      await this.notificationService.scheduleMaintenanceNotification(maintenance, notificationDate)
    }
  }

  async getMaintenanceStats(assetId?: string) {
    const query = this.maintenanceRepository.createQueryBuilder("maintenance")

    if (assetId) {
      query.where("maintenance.assetId = :assetId", { assetId })
    }

    const [total, completed, scheduled, overdue, inProgress] = await Promise.all([
      query.getCount(),
      query.clone().where("maintenance.status = :status", { status: MaintenanceStatus.COMPLETED }).getCount(),
      query.clone().where("maintenance.status = :status", { status: MaintenanceStatus.SCHEDULED }).getCount(),
      query.clone().where("maintenance.status = :status", { status: MaintenanceStatus.OVERDUE }).getCount(),
      query.clone().where("maintenance.status = :status", { status: MaintenanceStatus.IN_PROGRESS }).getCount(),
    ])

    return {
      total,
      completed,
      scheduled,
      overdue,
      inProgress,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    }
  }
}
