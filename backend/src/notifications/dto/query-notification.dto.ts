import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryNotificationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isRead?: boolean;

  @IsOptional()
  @IsString()
  type?: string;
}
