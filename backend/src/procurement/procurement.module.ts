import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';
import { ProcurementRequest } from './entities/procurement-request.entity';
import { AssetRegistration } from './entities/asset-registration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProcurementRequest, AssetRegistration])],
  controllers: [ProcurementController],
  providers: [ProcurementService],
  exports: [ProcurementService],
})
export class ProcurementModule {}
