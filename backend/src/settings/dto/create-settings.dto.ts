import { IsString } from 'class-validator';

export class CreateSettingsDto {
  @IsString()
  defaultCurrency: string;

  @IsString()
  timezone: string;

  @IsString()
  depreciationMethod: string;
}
