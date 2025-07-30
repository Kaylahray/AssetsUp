import { Controller, Post, Body, Get, Patch, Param } from "@nestjs/common";
import { MaintenanceScheduleService } from "./maintenance-schedule.service";

@Controller("maintenance-schedules")
export class MaintenanceScheduleController {
  constructor(private readonly service: MaintenanceScheduleService) {}

  @Post()
  create(@Body() body) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Patch(":id/complete")
  markComplete(@Param("id") id: string) {
    return this.service.markAsCompleted(id);
  }
}
