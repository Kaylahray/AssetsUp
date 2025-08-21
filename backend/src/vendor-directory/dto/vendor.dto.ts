import { IsString, IsEnum, IsEmail, IsOptional, IsObject, IsBoolean, Matches } from 'class-validator';
import { VendorCategory } from '../entities/vendor.entity';

export class CreateVendorDto {
  @IsString()
  name: string;

  @IsString()
  registrationNumber: string;

  @IsEnum(VendorCategory)
  category: VendorCategory;

  @IsString()
  region: string;

  @IsString()
  address: string;

  @IsString()
  contactPerson: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  phone: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  additionalDetails?: Record<string, any>;

  @IsString()
  @IsOptional()
  taxIdentificationNumber?: string;
}

export class UpdateVendorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(VendorCategory)
  @IsOptional()
  category?: VendorCategory;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  phone?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  additionalDetails?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  taxIdentificationNumber?: string;
}

export class VendorFilterDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(VendorCategory)
  @IsOptional()
  category?: VendorCategory;

  @IsString()
  @IsOptional()
  region?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  registrationNumber?: string;
}
