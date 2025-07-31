import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WarrantyService } from './warranty.service';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { UpdateWarrantyDto } from './dto/update-warranty.dto';

@Controller('warranties')
export class WarrantyController {
  constructor(private readonly warrantyService: WarrantyService) {}

  @Post()
  create(@Body() dto: CreateWarrantyDto) {
    return this.warrantyService.create(dto);
  }

  @Get()
  findAll() {
    return this.warrantyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warrantyService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWarrantyDto) {
    return this.warrantyService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warrantyService.remove(id);
  }
}
