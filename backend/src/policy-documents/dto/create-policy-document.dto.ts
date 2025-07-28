import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsNumber,
  Length,
  Min,
} from "class-validator";
import { PolicyDocumentStatus, PolicyDocumentType } from "../entities/policy-document.entity";

export class CreatePolicyDocumentDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  version: string;

  @IsEnum(PolicyDocumentStatus)
  @IsOptional()
  status?: PolicyDocumentStatus;

  @IsEnum(PolicyDocumentType)
  @IsOptional()
  documentType?: PolicyDocumentType;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  filePath: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  fileType: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  fileSize: number;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  originalFileName?: string;

  @IsUUID()
  @IsNotEmpty()
  authorId: string;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  keyPoints?: string;

  @IsString()
  @IsOptional()
  complianceNotes?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  department?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  category?: string;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsBoolean()
  @IsOptional()
  requiresAcknowledgment?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  approvedBy?: string;

  @IsDateString()
  @IsOptional()
  approvedDate?: string;

  @IsString()
  @IsOptional()
  approvalNotes?: string;

  @IsString()
  @IsOptional()
  changeLog?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  previousVersionId?: string;

  @IsBoolean()
  @IsOptional()
  isLatestVersion?: boolean;

  @IsString()
  @IsOptional()
  metadata?: string;
} 