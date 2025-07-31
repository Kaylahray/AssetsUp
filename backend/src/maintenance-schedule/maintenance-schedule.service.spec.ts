import { Test, TestingModule } from "@nestjs/testing";
import { MaintenanceScheduleService } from "./maintenance-schedule.service";

describe("MaintenanceScheduleService", () => {
  let service: MaintenanceScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaintenanceScheduleService],
    }).compile();

    service = module.get<MaintenanceScheduleService>(
      MaintenanceScheduleService
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
