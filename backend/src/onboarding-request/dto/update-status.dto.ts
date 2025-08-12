import { IsUUID, IsOptional, IsString } from "class-validator";

export class UpdateStatusDto {
  @IsUUID()
  reviewerId: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
