import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class MedicineService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMedicineDto) {
    return this.prisma.medicine.create({ data: dto });
  }

  async findAll() {
    return this.prisma.medicine.findMany();
  }

  async findOne(id: string) {
    const medicine = await this.prisma.medicine.findUnique({ where: { id } });
    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }
    return medicine;
  }
  async findByCode(code: string) {
  const medicine = await this.prisma.medicine.findUnique({ where: { code } });
  if (!medicine) {
    throw new NotFoundException('No medicine found with this barcode');
  }
  return medicine;
}

  async update(id: string, dto: UpdateMedicineDto) {
    await this.findOne(id);
    return this.prisma.medicine.update({ where: { id }, data: dto });
  }

  async updateStock(id: string, quantityChange: number) {
    const medicine = await this.findOne(id);
    const newStock = medicine.stockQty + quantityChange;

    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.prisma.medicine.update({
      where: { id },
      data: { stockQty: newStock },
    });
  }
}