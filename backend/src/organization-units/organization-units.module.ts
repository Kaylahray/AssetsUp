import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationUnit } from './entities/organization-unit.entity';
import { OrganizationUnitsService } from './organization-units.service';
import { OrganizationUnitsController } from './organization-units.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationUnit])],
  controllers: [OrganizationUnitsController],
  providers: [OrganizationUnitsService],
})
export class OrganizationUnitsModule {} 