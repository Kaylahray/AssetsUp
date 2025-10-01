import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    role: 'admin' | 'user' | 'manager';

    @IsOptional()
    companyId?: number;
    @IsOptional()
    departmentId?: number;
    @IsOptional()
    branchId?: number;

  // companyId, departmentId, branchId can be added for mapping
}
