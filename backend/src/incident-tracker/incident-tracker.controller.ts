import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { IncidentTrackerService } from './incident-tracker.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

@Controller('incidents')
export class IncidentTrackerController {
  constructor(private readonly incidentService: IncidentTrackerService) {}

  @Post()
  create(@Body() dto: CreateIncidentDto) {
    return this.incidentService.create(dto);
  }

  @Get()
  findAll() {
    return this.incidentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIncidentDto) {
    return this.incidentService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incidentService.remove(Number(id));
  }
} 