import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreatePatientDto {
  @IsDateString()
  dob!: string;

  @IsString()
  @IsNotEmpty()
  gender!: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  address?: string;
}