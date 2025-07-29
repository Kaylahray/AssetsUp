import { Test, TestingModule } from '@nestjs/testing';
import { DeviceHealthService } from './device-health.service';

describe('DeviceHealthService', () => {
  let service: DeviceHealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceHealthService],
    }).compile();

    service = module.get<DeviceHealthService>(DeviceHealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
