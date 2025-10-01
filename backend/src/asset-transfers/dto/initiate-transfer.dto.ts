import { IsUUID, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitiateTransferDto {
  @ApiProperty({ description: 'UUID of the asset to transfer', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  assetId: string;

  @ApiPropertyOptional({ description: 'Source department ID', example: 1 })
  @IsInt()
  @IsOptional()
  fromDepartmentId?: number;

  @ApiProperty({ description: 'Target department ID', example: 2 })
  @IsInt()
  @IsNotEmpty()
  toDepartmentId: number;

  @ApiProperty({ description: 'User initiating the transfer', example: 'john.doe@company.com', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  initiatedBy: string;

  @ApiPropertyOptional({ description: 'Reason for transfer', example: 'Department reorganization' })
  @IsString()
  @IsOptional()
  reason?: string;
}