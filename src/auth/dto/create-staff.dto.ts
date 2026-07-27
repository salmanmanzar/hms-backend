import { IsString, IsNotEmpty, IsEmail, IsIn } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsIn(['admin', 'doctor', 'receptionist', 'pharmacist'])
  role!: string;
}