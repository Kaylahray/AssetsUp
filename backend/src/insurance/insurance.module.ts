import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AssetInsurance } from './asset-insurance.entity';
import { AssetInsuranceService } from './asset-insurance.service';
import { AssetInsuranceController } from './asset-insurance.controller';
import { NotificationService } from './notification.service';
import { ExpirySchedulerService } from './expiry-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetInsurance]),
    ScheduleModule, // allow injection of scheduler, but make sure ScheduleModule.forRoot() is registered in AppModule
  ],
  providers: [AssetInsuranceService, NotificationService, ExpirySchedulerService],
  controllers: [AssetInsuranceController],
  exports: [AssetInsuranceService],
})
export class AssetInsuranceModule {}
