import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from "class-validator";
import { VendorType, VendorStatus } from "../vendor.enums";

export class CreateVendorDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsEnum(VendorType)
  type: VendorType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPerson?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phoneNumber: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  taxId: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;
}
