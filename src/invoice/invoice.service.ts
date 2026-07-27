import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInvoiceDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const existing = await this.prisma.invoice.findUnique({
      where: { appointmentId: dto.appointmentId },
    });
    if (existing) {
      throw new ConflictException('Invoice already exists for this appointment');
    }

    return this.prisma.invoice.create({
      data: {
        appointmentId: dto.appointmentId,
        amount: dto.amount,
      },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async markAsPaid(id: string) {
    await this.findOne(id);
    return this.prisma.invoice.update({
      where: { id },
      data: { paymentStatus: 'paid' },
    });
  }
}