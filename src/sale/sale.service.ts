import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

const COMMISSION_RATE = 0.10;
const DOCTOR_DISCOUNT_RATE = 0.05;

@Injectable()
export class SaleService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSaleDto) {
    if (dto.patientId) {
      const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
    }

    if (dto.doctorId) {
      const doctor = await this.prisma.doctor.findUnique({ where: { id: dto.doctorId } });
      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }
    }

    let subtotal = 0;
    const itemsData: { medicineId: string; quantity: number; priceAtSale: number }[] = [];

    for (const item of dto.items) {
      const medicine = await this.prisma.medicine.findUnique({ where: { id: item.medicineId } });
      if (!medicine) {
        throw new NotFoundException(`Medicine not found: ${item.medicineId}`);
      }
      if (medicine.stockQty < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${medicine.name}`);
      }

      subtotal += medicine.price * item.quantity;
      itemsData.push({
        medicineId: item.medicineId,
        quantity: item.quantity,
        priceAtSale: medicine.price,
      });
    }

    const discountAmount = dto.doctorId ? subtotal * DOCTOR_DISCOUNT_RATE : 0;
    const totalAmount = subtotal - discountAmount;
    const commissionAmount = dto.doctorId ? totalAmount * COMMISSION_RATE : null;

    const sale = await this.prisma.sale.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        subtotal,
        discountAmount,
        totalAmount,
        commissionAmount,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: { include: { medicine: true } },
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    for (const item of dto.items) {
      await this.prisma.medicine.update({
        where: { id: item.medicineId },
        data: { stockQty: { decrement: item.quantity } },
      });
    }

    return sale;
  }

  async findAll() {
    return this.prisma.sale.findMany({
      include: {
        items: { include: { medicine: true } },
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}