import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class SetupPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}