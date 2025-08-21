import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorDirectoryController } from './vendor-directory.controller';
import { VendorDirectoryService } from './vendor-directory.service';
import { Vendor } from './entities/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor])],
  controllers: [VendorDirectoryController],
  providers: [VendorDirectoryService],
  exports: [VendorDirectoryService],
})
export class VendorDirectoryModule {}
