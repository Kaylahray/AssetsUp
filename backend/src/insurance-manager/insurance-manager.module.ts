import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Insurance } from './entities/insurance.entity';
import { InsuranceManagerService } from './insurance-manager.service';
import { InsuranceManagerController } from './insurance-manager.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Insurance])],
  providers: [InsuranceManagerService],
  controllers: [InsuranceManagerController],
})
export class InsuranceManagerModule {} 