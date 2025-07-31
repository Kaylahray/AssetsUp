import { Test, TestingModule } from '@nestjs/testing';
import { DeviceHealthController } from './device-health.controller';
import { DeviceHealthService } from './device-health.service';

describe('DeviceHealthController', () => {
  let controller: DeviceHealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceHealthController],
      providers: [DeviceHealthService],
    }).compile();

    controller = module.get<DeviceHealthController>(DeviceHealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
