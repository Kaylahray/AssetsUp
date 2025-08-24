import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThan } from "typeorm";
import {
  MaintenanceFrequency,
  MaintenanceSchedule,
  ScheduleStatus,
} from "./entities/maintenance-schedule.entity/maintenance-schedule.entity";
import { CreateMaintenanceScheduleDto } from "./dto/create-maintainance-schedule.dto";
import { Cron, CronExpression } from "@nestjs/schedule";
import { UpdateMaintenanceScheduleDto } from "./dto/update-maintainance-schedule.dto";
import { QueryMaintenanceScheduleDto } from "./dto/query-maintanace-schedule.dto";

@Injectable()
export class MaintenanceScheduleService {
  constructor(
    @InjectRepository(MaintenanceSchedule)
    private readonly scheduleRepository: Repository<MaintenanceSchedule>
  ) {}

  async create(
    createDto: CreateMaintenanceScheduleDto
  ): Promise<MaintenanceSchedule> {
    // Validate that either assetId or assetName is provided
    if (!createDto.assetId && !createDto.assetName) {
      throw new BadRequestException(
        "Either assetId or assetName must be provided"
      );
    }

    // Validate custom interval for custom frequency
    if (
      createDto.frequency === MaintenanceFrequency.CUSTOM &&
      !createDto.customIntervalDays
    ) {
      throw new BadRequestException(
        "customIntervalDays is required for custom frequency"
      );
    }

    const schedule = this.scheduleRepository.create({
      ...createDto,
      nextMaintenanceDate: new Date(createDto.nextMaintenanceDate),
      lastMaintenanceDate: createDto.lastMaintenanceDate
        ? new Date(createDto.lastMaintenanceDate)
        : null,
    });

    return await this.scheduleRepository.save(schedule);
  }

  async findAll(query: QueryMaintenanceScheduleDto): Promise<{
    schedules: MaintenanceSchedule[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.scheduleRepository.createQueryBuilder("schedule");

    // Apply filters
    if (filters.assetId) {
      queryBuilder.andWhere("schedule.assetId = :assetId", {
        assetId: filters.assetId,
      });
    }

    if (filters.assetName) {
      queryBuilder.andWhere("schedule.assetName ILIKE :assetName", {
        assetName: `%${filters.assetName}%`,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere("schedule.status = :status", {
        status: filters.status,
      });
    }

    if (filters.frequency) {
      queryBuilder.andWhere("schedule.frequency = :frequency", {
        frequency: filters.frequency,
      });
    }

    if (filters.dueBefore) {
      queryBuilder.andWhere("schedule.nextMaintenanceDate <= :dueBefore", {
        dueBefore: new Date(filters.dueBefore),
      });
    }

    if (filters.dueAfter) {
      queryBuilder.andWhere("schedule.nextMaintenanceDate >= :dueAfter", {
        dueAfter: new Date(filters.dueAfter),
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and get results
    const schedules = await queryBuilder
      .orderBy("schedule.nextMaintenanceDate", "ASC")
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      schedules,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<MaintenanceSchedule> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException(
        `Maintenance schedule with ID ${id} not found`
      );
    }
    return schedule;
  }

  async findByAsset(
    assetId?: string,
    assetName?: string
  ): Promise<MaintenanceSchedule[]> {
    if (!assetId && !assetName) {
      throw new BadRequestException(
        "Either assetId or assetName must be provided"
      );
    }

    const where: any = {};
    if (assetId) where.assetId = assetId;
    if (assetName) where.assetName = assetName;

    return await this.scheduleRepository.find({
      where,
      order: { nextMaintenanceDate: "ASC" },
    });
  }

  async update(
    id: string,
    updateDto: UpdateMaintenanceScheduleDto
  ): Promise<MaintenanceSchedule> {
    const schedule = await this.findOne(id);

    // Validate custom interval for custom frequency
    if (
      updateDto.frequency === MaintenanceFrequency.CUSTOM &&
      !updateDto.customIntervalDays
    ) {
      throw new BadRequestException(
        "customIntervalDays is required for custom frequency"
      );
    }

    // Update dates if provided as strings
    const updateData: any = { ...updateDto };
    if (updateDto.nextMaintenanceDate) {
      updateData.nextMaintenanceDate = new Date(updateDto.nextMaintenanceDate);
    }
    if (updateDto.lastMaintenanceDate) {
      updateData.lastMaintenanceDate = new Date(updateDto.lastMaintenanceDate);
    }

    Object.assign(schedule, updateData);
    return await this.scheduleRepository.save(schedule);
  }

  async remove(id: string): Promise<void> {
    const schedule = await this.findOne(id);
    await this.scheduleRepository.remove(schedule);
  }

  async markCompleted(id: string): Promise<MaintenanceSchedule> {
    const schedule = await this.findOne(id);

    schedule.status = ScheduleStatus.COMPLETED;
    schedule.lastMaintenanceDate = new Date();
    schedule.nextMaintenanceDate = this.calculateNextMaintenanceDate(
      schedule.frequency,
      schedule.customIntervalDays
    );
    schedule.status = ScheduleStatus.ACTIVE; // Reactivate for next cycle

    return await this.scheduleRepository.save(schedule);
  }

  async getUpcomingMaintenance(
    days: number = 7
  ): Promise<MaintenanceSchedule[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return await this.scheduleRepository.find({
      where: {
        nextMaintenanceDate: LessThan(endDate),
        status: ScheduleStatus.ACTIVE,
      },
      order: { nextMaintenanceDate: "ASC" },
    });
  }

  async getOverdueMaintenance(): Promise<MaintenanceSchedule[]> {
    return await this.scheduleRepository.find({
      where: {
        nextMaintenanceDate: LessThan(new Date()),
        status: ScheduleStatus.ACTIVE,
      },
      order: { nextMaintenanceDate: "ASC" },
    });
  }

  private calculateNextMaintenanceDate(
    frequency: MaintenanceFrequency,
    customIntervalDays?: number
  ): Date {
    const now = new Date();
    const nextDate = new Date(now);

    switch (frequency) {
      case MaintenanceFrequency.WEEKLY:
        nextDate.setDate(now.getDate() + 7);
        break;
      case MaintenanceFrequency.MONTHLY:
        nextDate.setMonth(now.getMonth() + 1);
        break;
      case MaintenanceFrequency.QUARTERLY:
        nextDate.setMonth(now.getMonth() + 3);
        break;
      case MaintenanceFrequency.SEMI_ANNUALLY:
        nextDate.setMonth(now.getMonth() + 6);
        break;
      case MaintenanceFrequency.ANNUALLY:
        nextDate.setFullYear(now.getFullYear() + 1);
        break;
      case MaintenanceFrequency.CUSTOM:
        if (customIntervalDays) {
          nextDate.setDate(now.getDate() + customIntervalDays);
        }
        break;
    }

    return nextDate;
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async checkOverdueMaintenance(): Promise<void> {
    console.log("Running daily maintenance check...");

    const overdueSchedules = await this.scheduleRepository.find({
      where: {
        nextMaintenanceDate: LessThan(new Date()),
        status: ScheduleStatus.ACTIVE,
      },
    });

    for (const schedule of overdueSchedules) {
      schedule.status = ScheduleStatus.OVERDUE;
      await this.scheduleRepository.save(schedule);

      console.log(
        `MAINTENANCE OVERDUE: ${schedule.assetName || schedule.assetId} - ${
          schedule.maintenanceDescription || "Scheduled maintenance"
        }`
      );
    }

    console.log(
      `Found ${overdueSchedules.length} overdue maintenance schedules`
    );
  }

  @Cron(CronExpression.EVERY_MONDAY_AT_8AM)
  async weeklyMaintenanceSummary(): Promise<void> {
    console.log("Generating weekly maintenance summary...");

    const upcomingMaintenance = await this.getUpcomingMaintenance(7);
    const overdueMaintenance = await this.getOverdueMaintenance();

    console.log(`Weekly Maintenance Summary:
    - Upcoming (next 7 days): ${upcomingMaintenance.length}
    - Overdue: ${overdueMaintenance.length}`);

    upcomingMaintenance.forEach((schedule) => {
      console.log(
        `UPCOMING: ${
          schedule.assetName || schedule.assetId
        } due ${schedule.nextMaintenanceDate.toDateString()}`
      );
    });
  }

  // Utility method to manually trigger job simulation
  async runMaintenanceCheck(): Promise<{
    overdue: MaintenanceSchedule[];
    upcoming: MaintenanceSchedule[];
  }> {
    const overdue = await this.getOverdueMaintenance();
    const upcoming = await this.getUpcomingMaintenance();

    return { overdue, upcoming };
  }

  markAsCompleted(id: string) {
    return this.scheduleRepository.update(id, {
      status: ScheduleStatus.COMPLETED,
    });
  }

  findUpcomingReminders() {
    const now = new Date();
    const nextDay = new Date();
    nextDay.setDate(now.getDate() + 1);
    return this.scheduleRepository.find({
      where: {
        scheduleDate: Between(now, nextDay),
        status: ScheduleStatus.PENDING,
      },
    });
  }
}
