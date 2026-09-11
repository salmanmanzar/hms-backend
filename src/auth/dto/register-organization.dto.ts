import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional } from 'class-validator';

export class RegisterOrganizationDto {
    @IsString()
    @IsNotEmpty()
    adminName!: string;

    @IsEmail()
    adminEmail!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsString()
    @IsNotEmpty()
    organizationName!: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    subscriptionPlan?: string;
}