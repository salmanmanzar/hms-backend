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

  async update(id: string, dto: UpdatePatientDto) {
    await this.findOne(id, { userId: '', role: 'admin' });
    return this.prisma.patient.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id, { userId: '', role: 'admin' });
    return this.prisma.patient.delete({ where: { id } });
  }
}