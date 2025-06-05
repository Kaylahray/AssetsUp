import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export enum UserRole {
  ADMIN = "admin",
  ASSET_MANAGER = "asset_manager",
  DEPARTMENT_HEAD = "department_head",
  EMPLOYEE = "employee",
}

export class CreateUserDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  name: string

  @ApiProperty({ example: "john@example.com" })
  @IsEmail()
  email: string

  @ApiProperty({ example: "password123", minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string

  @ApiProperty({ enum: UserRole, default: UserRole.EMPLOYEE })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole

  @ApiProperty({ example: "IT", required: false })
  @IsString()
  @IsOptional()
  department?: string

  @ApiProperty({ example: "Software Engineer", required: false })
  @IsString()
  @IsOptional()
  position?: string

  @ApiProperty({ example: "branch-id", required: false })
  @IsString()
  @IsOptional()
  branchId?: string
}
