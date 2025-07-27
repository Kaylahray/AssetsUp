import { IsString, IsIn } from 'class-validator';

export class GenerateBarcodeDto {
  @IsString()
  code: string;

  @IsIn(['png', 'svg'])
  format: 'png' | 'svg';
}
