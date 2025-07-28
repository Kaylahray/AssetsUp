import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MobileDevicesService } from "./mobile-devices.service";
import { MobileDevicesController } from "./mobile-devices.controller";
import { MobileDevice } from "./entities/mobile-device.entity";

@Module({
  imports: [TypeOrmModule.forFeature([MobileDevice])],
  controllers: [MobileDevicesController],
  providers: [MobileDevicesService],
  exports: [MobileDevicesService],
})
export class MobileDevicesModule {} 