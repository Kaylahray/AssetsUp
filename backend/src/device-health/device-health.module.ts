import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { DeviceHealth } from './entities/device-health.entity';
import { DeviceHealthService } from './device-health.service';
import { DeviceHealthController } from './device-health.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceHealth]),
    ScheduleModule.forRoot(), 
  ],
  controllers: [DeviceHealthController],
  providers: [DeviceHealthService],
  exports: [DeviceHealthService],
})
export class DeviceHealthModule {}