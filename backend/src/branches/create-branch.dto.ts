import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
} from "class-validator";
import { BranchStatus } from "../entities/branch.entity";

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  address: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsString()
  manager: string;

  @IsEnum(BranchStatus)
  status: BranchStatus;
}
