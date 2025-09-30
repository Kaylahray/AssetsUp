import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  serialNumber: string;

  @IsDateString()
  purchaseDate: string;

  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  @IsNumber()
  supplierId: number;

  @IsOptional()
  @IsNumber()
  assignedDepartmentId?: number;

  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsNumber()
  purchaseCost?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
