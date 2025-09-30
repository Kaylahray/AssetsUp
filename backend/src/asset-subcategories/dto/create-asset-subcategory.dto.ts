import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateAssetSubcategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  parentCategoryId: number;
}
