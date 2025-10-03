import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { Branch } from './entities/branch.entity';
import { Company } from '../companies/entities/company.entity';
import { Department } from '../departments/department.entity';
import { Asset } from '../assets/entities/assest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Branch, Company, Department, Asset])],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}