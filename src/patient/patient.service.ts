import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePatientDto) {
    return this.prisma.patient.create({
      data: {
        userId,
        dob: new Date(dto.dob),
        gender: dto.gender,
        bloodGroup: dto.bloodGroup,
        address: dto.address,
      },
    });
  }

  async findAll() {
    return this.prisma.patient.findMany({
      include: { user: { select: { name: true, email: true } } },
    });
  }
  async findByUserId(userId: string) {
  return this.prisma.patient.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true } } },
  });
}

async findByEmail(email: string) {
  const patient = await this.prisma.patient.findFirst({
    where: { user: { email } },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!patient) {
    throw new NotFoundException('No patient found with this email');
  }
  return patient;
}

  async findOne(id: string, currentUser: { userId: string; role: string }) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (currentUser.role === 'patient' && patient.userId !== currentUser.userId) {
      throw new ForbiddenException('You can only access your own record');
    }

    return patient;
  }
  async getHistory(patientId: string) {
  const patient = await this.prisma.patient.findUnique({
    where: { id: patientId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!patient) {
    throw new NotFoundException('Patient not found');
  }

  const appointments = await this.prisma.appointment.findMany({
    where: { patientId },
    include: {
      doctor: { include: { user: { select: { name: true } } } },
      prescription: { include: { items: { include: { medicine: true } } } },
      invoice: true,
    },
    orderBy: { scheduledAt: 'desc' },
  });

  const medicalRecords = await this.prisma.medicalRecord.findMany({
    where: { patientId },
    orderBy: { recordDate: 'desc' },
  });

  return { patient, appointments, medicalRecords };
}

  async update(id: string, dto: UpdatePatientDto) {
    await this.findOne(id, { userId: '', role: 'admin' });
    return this.prisma.patient.update({
      where: { id },
      data: dto,
    });
  }

  async addMedicalRecord(patientId: string, data: { diagnosis: string; symptoms?: string }) {
  const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) {
    throw new NotFoundException('Patient not found');
  }

  return this.prisma.medicalRecord.create({
    data: {
      patientId,
      diagnosis: data.diagnosis,
      symptoms: data.symptoms,
    },
  });
}

  async remove(id: string) {
    await this.findOne(id, { userId: '', role: 'admin' });
    return this.prisma.patient.delete({ where: { id } });
  }
}

