import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cargo } from './entities/cargo.entity';
import { CargoService } from './cargo.service';
import { CargoController } from './cargo.controller';
import { Shipment } from '../shipments/entities/shipment.entity'; // Assuming path

@Module({
  imports: [TypeOrmModule.forFeature([Cargo, Shipment])],
  controllers: [CargoController],
  providers: [CargoService],
})
export class CargoModule {}