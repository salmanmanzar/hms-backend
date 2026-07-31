import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(userId: string, role: string, dto: CreateAppointmentDto) {
  let patient;

  if (role === 'receptionist' || role === 'admin') {
    if (!dto.patientId) {
      throw new BadRequestException('Patient ID is required when booking on behalf of a patient');
    }
    patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
      include: { user: true },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
  } else {
    patient = await this.prisma.patient.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }
  }

  const doctor = await this.prisma.doctor.findUnique({
    where: { id: dto.doctorId },
    include: { user: true },
  });
  if (!doctor) {
    throw new NotFoundException('Doctor not found');
  }

  const scheduledAt = new Date(dto.scheduledAt);

  const now = new Date();
  const pakistanNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
  if (scheduledAt < pakistanNow) {
    throw new BadRequestException('Cannot book an appointment in the past');
  }

  const existing = await this.prisma.appointment.findFirst({
    where: {
      doctorId: dto.doctorId,
      scheduledAt,
      status: { not: 'cancelled' },
    },
  });
  if (existing) {
    throw new BadRequestException('Doctor already has an appointment at this time');
  }

  const appointment = await this.prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: dto.doctorId,
      scheduledAt,
      reason: dto.reason,
    },
  });

  this.notificationService.sendAppointmentConfirmation(
    patient.user.email,
    patient.user.name,
    scheduledAt,
    doctor.user.name,
    false,
  ).catch((err) => console.error('Patient email failed:', err));

  this.notificationService.sendAppointmentConfirmation(
    doctor.user.email,
    doctor.user.name,
    scheduledAt,
    patient.user.name,
    true,
  ).catch((err) => console.error('Doctor email failed:', err));

  return appointment;
}
  async findAll(currentUser?: { userId: string; role: string }) {
  if (currentUser?.role === 'doctor') {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: currentUser.userId },
    });
    if (!doctor) {
      return [];
    }
    return this.prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  return this.prisma.appointment.findMany({
    include: {
      patient: { include: { user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
    },
  });
}

  async findOne(id: string, currentUser: { userId: string; role: string }) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (currentUser.role === 'patient') {
      const patient = await this.prisma.patient.findUnique({ where: { userId: currentUser.userId } });
      if (!patient || appointment.patientId !== patient.id) {
        throw new ForbiddenException('You can only access your own appointments');
      }
    }

    return appointment;
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id, { userId: '', role: 'admin' });
    return this.prisma.appointment.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string) {
    await this.findOne(id, { userId: '', role: 'admin' });
    return this.prisma.appointment.delete({ where: { id } });
  }
}