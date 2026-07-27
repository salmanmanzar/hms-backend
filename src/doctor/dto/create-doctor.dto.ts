import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  specialization!: string;

  @IsString()
  @IsNotEmpty()
  qualification!: string;

  @IsString()
  @IsNotEmpty()
  departmentId!: string;
}