import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
} from "class-validator";

export class CreateOnboardingRequestDto {
  @IsUUID()
  requesterId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  estimatedValue?: number;

  @IsOptional()
  @IsString()
  proposedCategory?: string;
}
