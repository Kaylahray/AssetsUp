import { IsOptional, IsString, IsBoolean, IsNumber, Min, IsIn } from "class-validator"
import { Transform, Type } from "class-transformer"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class BranchQueryDto {
  @ApiPropertyOptional({ description: "Search by name or branch code" })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ description: "Filter by city" })
  @IsOptional()
  @IsString()
  city?: string

  @ApiPropertyOptional({ description: "Filter by state" })
  @IsOptional()
  @IsString()
  state?: string

  @ApiPropertyOptional({ description: "Filter by country" })
  @IsOptional()
  @IsString()
  country?: string

  @ApiPropertyOptional({ description: "Filter by active status" })
  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ description: "Sort by field", enum: ["name", "createdAt", "city", "state"] })
  @IsOptional()
  @IsString()
  @IsIn(["name", "createdAt", "city", "state"])
  sortBy?: string = "createdAt"

  @ApiPropertyOptional({ description: "Sort order", enum: ["ASC", "DESC"] })
  @IsOptional()
  @IsString()
  @IsIn(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC" = "DESC"

  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: "Items per page", default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10
}
