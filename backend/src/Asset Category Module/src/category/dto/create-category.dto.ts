import {
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCategoryDto {
  @ApiProperty({
    description: "Category name",
    example: "Electronics",
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: "Category description",
    example: "Electronic devices and gadgets",
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: "Category icon URL",
    example: "https://example.com/icons/electronics.png",
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  iconUrl?: string;

  @ApiPropertyOptional({
    description: "Parent category ID for nested categories",
    example: "uuid-string",
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}
