import { IsString, IsArray, IsOptional, IsIn } from 'class-validator';
import { CustomFieldType } from './custom-field.entity';

export class CreateCustomFieldDto {
  @IsString()
  name: string;

  @IsIn(['text', 'dropdown', 'number', 'date'])
  type: CustomFieldType;

  @IsOptional()
  @IsArray()
  options?: string[];
}

export class CreateCustomFormDto {
  @IsString()
  name: string;

  @IsArray()
  fields: CreateCustomFieldDto[];
}
