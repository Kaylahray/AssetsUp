import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  HttpStatus,
  Delete,
  HttpCode,
  Query,
} from "@nestjs/common";
import { MaintenanceScheduleService } from "./maintenance-schedule.service";
import { UpdateMaintenanceScheduleDto } from "./dto/update-maintainance-schedule.dto";
import { CreateMaintenanceScheduleDto } from "./dto/create-maintainance-schedule.dto";
import { QueryMaintenanceScheduleDto } from "./dto/query-maintanace-schedule.dto";

@Controller("maintenance-schedules")
export class MaintenanceSchedulerController {
  constructor(
    private readonly maintenanceSchedulerService: MaintenanceSchedulerService
  ) {}

  @Post()
  async create(
    @Body() createMaintenanceScheduleDto: CreateMaintenanceScheduleDto
  ) {
    return await this.maintenanceSchedulerService.create(
      createMaintenanceScheduleDto
    );
  }

  @Get()
  async findAll(@Query() query: QueryMaintenanceScheduleDto) {
    return await this.maintenanceSchedulerService.findAll(query);
  }

  @Get("upcoming")
  async getUpcoming(@Query("days") days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 7;
    return await this.maintenanceSchedulerService.getUpcomingMaintenance(
      daysNumber
    );
  }

  @Get("overdue")
  async getOverdue() {
    return await this.maintenanceSchedulerService.getOverdueMaintenance();
  }

  @Get("by-asset")
  async findByAsset(
    @Query("assetId") assetId?: string,
    @Query("assetName") assetName?: string
  ) {
    return await this.maintenanceSchedulerService.findByAsset(
      assetId,
      assetName
    );
  }

  @Get("check")
  async runMaintenanceCheck() {
    return await this.maintenanceSchedulerService.runMaintenanceCheck();
  }

  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return await this.maintenanceSchedulerService.findOne(id);
  }

  @Patch(":id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateMaintenanceScheduleDto: UpdateMaintenanceScheduleDto
  ) {
    return await this.maintenanceSchedulerService.update(
      id,
      updateMaintenanceScheduleDto
    );
  }

  @Patch(":id/complete")
  async markCompleted(@Param("id", ParseUUIDPipe) id: string) {
    return await this.maintenanceSchedulerService.markCompleted(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    await this.maintenanceSchedulerService.remove(id);
  }

  @Patch(":id/complete")
  markComplete(@Param("id") id: string) {
    return this.maintenanceSchedulerService.markAsCompleted(id);
  }
}
