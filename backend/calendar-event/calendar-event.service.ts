import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CalendarEvent, EventType } from './entities/calendar-event.entity';
import { CreateCalendarEventDto} from './Dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './Dto/update-calendar-event.dto';

@Injectable()
export class CalendarEventService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly repo: Repository<CalendarEvent>,
  ) {}

  async create(dto: CreateCalendarEventDto): Promise<CalendarEvent> {
    const event = this.repo.create(dto);
    return this.repo.save(event);
  }

  async findAll(
    startDate?: string,
    endDate?: string,
    eventType?: EventType,
  ): Promise<CalendarEvent[]> {
    const where: any = {};
    if (startDate && endDate) where.eventDate = Between(startDate, endDate);
    if (eventType) where.eventType = eventType;
    return this.repo.find({ where });
  }

  async findOne(id: string): Promise<CalendarEvent> {
    const event = await this.repo.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`CalendarEvent ${id} not found`);
    return event;
  }

  async update(id: string, dto: UpdateCalendarEventDto): Promise<CalendarEvent> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`CalendarEvent ${id} not found`);
  }
}
