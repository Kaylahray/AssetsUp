import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { EventType } from '../entities/calendar-event.entity';

export class CreateCalendarEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  eventDate: string;

  @IsString()
  resourceId: string;

  @IsEnum(EventType)
  eventType: EventType;

  @IsString()
  createdBy: string;

  @IsBoolean()
  @IsOptional()
  visibility?: boolean;

  @IsString()
  @IsOptional()
  recurrenceRule?: string;
}

