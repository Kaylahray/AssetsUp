import { IsString, IsNotEmpty, IsUUID, IsNumber, Min } from 'class-validator';

export class CreateCargoDto {
  @IsUUID()
  @IsNotEmpty()
  shipmentId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  weight: number;

  @IsNumber()
  @Min(0)
  value: number;
}