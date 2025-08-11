import { IsString, Length } from "class-validator";

export class CreateVoteDto {
  @IsString()
  @Length(3, 255)
  title: string;

  @IsString()
  description: string;
}
