import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

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

  @IsNumber()
  @Min(0)
  consultationFee!: number;
}