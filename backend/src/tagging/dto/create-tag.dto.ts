import { IsString, IsOptional, IsHexColor, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'Important', description: 'Tag name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'High priority items', description: 'Tag description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: '#FF0000', description: 'Hex color code' })
  @IsOptional()
  @IsHexColor()
  colorHex?: string;
}
