import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from "class-validator"
import { CustomFieldType } from "../entities/custom-field-definition.entity"

export class CreateCustomFieldDefinitionDto {
  @ApiProperty({ example: "Warranty Expiry" })
  @IsString()
  @IsNotEmpty()
  fieldName: string

  @ApiProperty({ enum: CustomFieldType })
  @IsEnum(CustomFieldType)
  fieldType: CustomFieldType

  @ApiPropertyOptional({
    description: "Required when fieldType is dropdown",
    example: ["Low", "Medium", "High"],
  })
  @ValidateIf((o) => o.fieldType === CustomFieldType.DROPDOWN)
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  allowedValues?: string[]

  @ApiProperty({ example: "assets" })
  @IsString()
  @IsNotEmpty()
  linkedModule: string

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean = false
}


