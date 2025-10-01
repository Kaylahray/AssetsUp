import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { FileCategory } from '../entities/file-upload.entity';

export class CreateFileUploadDto {
  @IsEnum(FileCategory)
  category: FileCategory;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  assetId?: string;

  @IsUUID()
  @IsOptional()
  supplierId?: string;
}
