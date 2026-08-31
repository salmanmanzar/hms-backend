import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class MedicineService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateMedicineDto, organizationId: string) {
    return this.prisma.medicine.create({ data: { ...dto, organizationId } });
  }

  async findAll(organizationId?: string | null) {
    return this.prisma.medicine.findMany({
      where: organizationId ? { organizationId } : {},
    });
  }
  async findOne(id: string) {
    const medicine = await this.prisma.medicine.findUnique({ where: { id } });
    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }
    return medicine;
  }
  async findByCode(code: string, organizationId?: string | null) {
    const medicine = await this.prisma.medicine.findFirst({
      where: { code, ...(organizationId ? { organizationId } : {}) },
    });
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