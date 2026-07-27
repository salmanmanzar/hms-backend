import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;
}