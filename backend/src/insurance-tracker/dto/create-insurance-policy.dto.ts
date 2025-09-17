import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEmail,
  IsPhoneNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { InsurancePolicyStatus, InsuranceType, CoverageLevel } from '../insurance.enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInsurancePolicyDto {
  @ApiProperty({ description: 'Unique policy number' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  policyNumber: string;

  @ApiProperty({ description: 'Insurance provider name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  provider: string;

  @ApiProperty({ description: 'Asset ID (optional for category-based policies)', required: false })
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiProperty({ description: 'Asset category (optional for asset-specific policies)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  assetCategory?: string;

  @ApiProperty({ description: 'Coverage start date' })
  @IsNotEmpty()
  @IsDateString()
  coverageStart: string;

  @ApiProperty({ description: 'Coverage end date' })
  @IsNotEmpty()
  @IsDateString()
  coverageEnd: string;

  @ApiProperty({ description: 'Insured value' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  insuredValue: number;

  @ApiProperty({ description: 'Terms and conditions URL', required: false })
  @IsOptional()
  @IsString()
  termsUrl?: string;

  @ApiProperty({ enum: InsurancePolicyStatus, description: 'Policy status', required: false })
  @IsOptional()
  @IsEnum(InsurancePolicyStatus)
  status?: InsurancePolicyStatus;

  @ApiProperty({ enum: InsuranceType, description: 'Insurance type', required: false })
  @IsOptional()
  @IsEnum(InsuranceType)
  insuranceType?: InsuranceType;

  @ApiProperty({ enum: CoverageLevel, description: 'Coverage level', required: false })
  @IsOptional()
  @IsEnum(CoverageLevel)
  coverageLevel?: CoverageLevel;

  @ApiProperty({ description: 'Premium amount', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  premiumAmount?: number;

  @ApiProperty({ description: 'Payment frequency (monthly, quarterly, annually)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentFrequency?: string;

  @ApiProperty({ description: 'Deductible amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deductible?: number;

  @ApiProperty({ description: 'Coverage details', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  coverageDetails?: string;

  @ApiProperty({ description: 'Policy exclusions', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  exclusions?: string;

  @ApiProperty({ description: 'Contact person name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPerson?: string;

  @ApiProperty({ description: 'Contact phone number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  @ApiProperty({ description: 'Contact email', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  contactEmail?: string;

  @ApiProperty({ description: 'Last renewal date', required: false })
  @IsOptional()
  @IsDateString()
  lastRenewalDate?: string;

  @ApiProperty({ description: 'Next renewal date', required: false })
  @IsOptional()
  @IsDateString()
  nextRenewalDate?: string;

  @ApiProperty({ description: 'Days before expiry to send renewal reminder', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  renewalReminderDays?: number;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
