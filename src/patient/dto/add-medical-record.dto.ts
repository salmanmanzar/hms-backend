import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddMedicalRecordDto {
  @IsString()
  @IsNotEmpty()
  diagnosis!: string;

  @IsOptional()
  @IsString()
  symptoms?: string;
}