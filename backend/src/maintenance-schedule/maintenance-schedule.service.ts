import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { MaintenanceSchedule } from "./entities/maintenance-schedule.entity/maintenance-schedule.entity";

@Injectable()
export class MaintenanceScheduleService {
  constructor(
    @InjectRepository(MaintenanceSchedule)
    private readonly repo: Repository<MaintenanceSchedule>
  ) {}

  create(data: Partial<MaintenanceSchedule>) {
    const schedule = this.repo.create(data);
    return this.repo.save(schedule);
  }

  findAll() {
    return this.repo.find();
  }

  markAsCompleted(id: string) {
    return this.repo.update(id, { status: "completed" });
  }

  findUpcomingReminders() {
    const now = new Date();
    const nextDay = new Date();
    nextDay.setDate(now.getDate() + 1);
    return this.repo.find({
      where: {
        scheduleDate: Between(now, nextDay),
        status: "pending",
      },
    });
  }
}
