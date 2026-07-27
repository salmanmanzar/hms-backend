import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePrescriptionDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const existing = await this.prisma.prescription.findUnique({
      where: { appointmentId: dto.appointmentId },
    });
    if (existing) {
      throw new ConflictException('Prescription already exists for this appointment');
    }

    return this.prisma.prescription.create({
      data: {
        appointmentId: dto.appointmentId,
        notes: dto.notes,
        items: {
          create: dto.items.map((item) => ({
            medicineId: item.medicineId,
            dosage: item.dosage,
          })),
        },
      },
      include: { items: { include: { medicine: true } } },
    });
  }

  async findOne(id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: { items: { include: { medicine: true } } },
    });
    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }
    return prescription;
  }

  async findByAppointment(appointmentId: string) {
    return this.prisma.prescription.findUnique({
      where: { appointmentId },
      include: { items: { include: { medicine: true } } },
    });
  }
}