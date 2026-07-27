import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  stockQty!: number;

  @IsNumber()
  @Min(0)
  price!: number;
}