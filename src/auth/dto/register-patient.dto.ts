import { IsString, IsNotEmpty, IsEmail, IsDateString, IsOptional } from 'class-validator';

export class RegisterPatientDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

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