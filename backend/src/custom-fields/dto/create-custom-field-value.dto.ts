import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsUUID } from "class-validator"

export class CreateCustomFieldValueDto {
  @ApiProperty({ example: "ASSET-123" })
  @IsString()
  @IsNotEmpty()
  referenceId: string

  @ApiProperty({ description: "ID of the field definition", example: "c1a2b3c4-d5e6-7890-1234-abcdefabcdef" })
  @IsUUID()
  fieldId: string

  @ApiProperty({
    description: "The value. Type must match the field's definition",
    example: "High",
  })
  value: any
}


