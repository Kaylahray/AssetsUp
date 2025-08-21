import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CalendarEventService } from './calendar-event.service';
import { CalendarEvent, EventType } from './entities/calendar-event.entity';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { CreateCalendarEventDto } from './Dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './Dto/update-calendar-event.dto';

@ApiTags('calendar-events')
@Controller('calendar-events')
export class CalendarEventController {
  constructor(private readonly service: CalendarEventService) {}

  @Post()
  create(@Body() dto: CreateCalendarEventDto): Promise<CalendarEvent> {
    return this.service.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'eventType', enum: EventType, required: false })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('eventType') eventType?: EventType,
  ): Promise<CalendarEvent[]> {
    return this.service.findAll(startDate, endDate, eventType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CalendarEvent> {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCalendarEventDto): Promise<CalendarEvent> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
