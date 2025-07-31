import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { InsuranceManagerService } from './insurance-manager.service';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';

@Controller('insurance')
export class InsuranceManagerController {
  constructor(private readonly insuranceService: InsuranceManagerService) {}

  @Post()
  create(@Body() dto: CreateInsuranceDto) {
    return this.insuranceService.create(dto);
  }

  @Get()
  findAll() {
    return this.insuranceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.insuranceService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInsuranceDto) {
    return this.insuranceService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.insuranceService.remove(Number(id));
  }
} 