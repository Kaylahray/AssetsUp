import { IsDateString, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ContractStatus } from '../enums/contract-status.enum';


export class CreateContractDto {
@IsString() @MinLength(1) @MaxLength(100)
contractId: string;


@IsString() @MinLength(1) @MaxLength(100)
vendorId: string;


@IsString() @MinLength(1) @MaxLength(200)
title: string;


@IsString() @MinLength(1)
terms: string;


@IsDateString()
startDate: string;


@IsDateString()
endDate: string;


@IsOptional()
@IsString() @MaxLength(500)
documentUrl?: string;


@IsOptional()
@IsEnum(ContractStatus)
status?: ContractStatus;
}