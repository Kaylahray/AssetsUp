import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
