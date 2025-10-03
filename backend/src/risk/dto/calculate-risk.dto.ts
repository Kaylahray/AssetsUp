import { IsIn, IsNotEmpty, IsString } from 'class-validator';

const validCargoTypes = ['GENERAL', 'HAZARDOUS', 'PERISHABLE'] as const;
type CargoType = (typeof validCargoTypes)[number];

export class CalculateRiskDto {
  @IsNotEmpty()
  @IsIn(validCargoTypes)
  cargoType: CargoType;

  @IsString()
  @IsNotEmpty()
  originCountry: string;

  @IsString()
  @IsNotEmpty()
  destinationCountry: string;

  @IsString()
  @IsNotEmpty()
  carrierId: string;
}
