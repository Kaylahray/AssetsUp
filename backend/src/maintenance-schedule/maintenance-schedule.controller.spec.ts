import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceScheduleController } from './maintenance-schedule.controller';

describe('MaintenanceScheduleController', () => {
  let controller: MaintenanceScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceScheduleController],
    }).compile();

    controller = module.get<MaintenanceScheduleController>(MaintenanceScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
