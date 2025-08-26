import { PartialType } from '@nestjs/mapped-types';
import { CreateContractDto } from './create-contract.dto';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ContractStatus } from '../enums/contract-status.enum';


export class UpdateContractDto extends PartialType(CreateContractDto) {
@IsOptional() @IsString() @MinLength(1) @MaxLength(100)
contractId?: string;


@IsOptional() @IsString() @MinLength(1) @MaxLength(100)
vendorId?: string;


@IsOptional() @IsString() @MinLength(1) @MaxLength(200)
title?: string;


@IsOptional() @IsString() @MinLength(1)
terms?: string;


@IsOptional() @IsDateString()
startDate?: string;


@IsOptional() @IsDateString()
endDate?: string;


@IsOptional() @IsString() @MaxLength(500)
documentUrl?: string;


@IsOptional() @IsEnum(ContractStatus)
status?: ContractStatus;
}