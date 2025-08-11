import { IsOptional, IsString, Length, IsNumber } from "class-validator";

export class UpdateVoteDto {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  votes?: number;
}
