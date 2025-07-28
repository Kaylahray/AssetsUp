import { IsOptional, IsEnum, IsString, IsBoolean, IsDateString } from "class-validator";
import { Transform } from "class-transformer";
import { PolicyDocumentStatus, PolicyDocumentType } from "../entities/policy-document.entity";

export class QueryPolicyDocumentDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PolicyDocumentStatus)
  status?: PolicyDocumentStatus;

  @IsOptional()
  @IsEnum(PolicyDocumentType)
  documentType?: PolicyDocumentType;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  requiresAcknowledgment?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  isLatestVersion?: boolean;

  @IsOptional()
  @IsDateString()
  effectiveDateBefore?: string;

  @IsOptional()
  @IsDateString()
  effectiveDateAfter?: string;

  @IsOptional()
  @IsDateString()
  expiryDateBefore?: string;

  @IsOptional()
  @IsDateString()
  expiryDateAfter?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt";

  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC" = "DESC";
} 