import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateDoctorDto) {
    return this.prisma.doctor.create({
      data: {
        userId,
        specialization: dto.specialization,
        qualification: dto.qualification,
        departmentId: dto.departmentId,
      },  
    });
  }

  async findAll(search?: string) {
  return this.prisma.doctor.findMany({
    where: search
      ? {
          OR: [
            { specialization: { contains: search, mode: 'insensitive' } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {},
    include: {
      user: { select: { name: true, email: true } },
      department: { select: { name: true } },
    },
  });
}

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        department: { select: { name: true } },
      },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor;
  }

  async update(id: string, dto: UpdateDoctorDto) {
    await this.findOne(id);
    return this.prisma.doctor.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.doctor.delete({ where: { id } });
  }
  async setAvailability(id: string, availability: Record<string, string[]>) {
  await this.findOne(id);
  return this.prisma.doctor.update({
    where: { id },
    data: { availability },
  });
}
async getAvailableSlots(doctorId: string, date: string) {
  const doctor = await this.findOne(doctorId);

  const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const availability = doctor.availability as Record<string, string[]> | null;
  if (!availability || !availability[dayName]) {
    return { date, availableSlots: [] };
  }

  const dayRanges = availability[dayName];
  const allSlots: string[] = [];

  for (const range of dayRanges) {
    const [start, end] = range.split('-');
    let [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    while (startHour < endHour || (startHour === endHour && startMin < endMin)) {
      const slotStart = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
      allSlots.push(slotStart);

      startMin += 30;
      if (startMin >= 60) {
        startMin -= 60;
        startHour += 1;
      }
    }
  }

  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);

  const bookedAppointments = await this.prisma.appointment.findMany({
    where: {
      doctorId,
      scheduledAt: { gte: dayStart, lte: dayEnd },
      status: { not: 'cancelled' },
    },
  });

  const bookedTimes = bookedAppointments.map((appt) => {
  const d = new Date(appt.scheduledAt);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
});

 const now = new Date();

const today = now.toLocaleDateString('en-CA', {
  timeZone: 'Asia/Karachi',
});

const availableSlots = allSlots.filter((slot) => {
  // Agar slot booked hai to remove kar do
  if (bookedTimes.includes(slot)) {
    return false;
  }

  // Sirf aaj ki date ke liye past slots remove karo
  if (date === today) {
    const [hour, minute] = slot.split(':').map(Number);

    const currentHour = Number(
      now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        hour12: false,
        timeZone: 'Asia/Karachi',
      }),
    );

    const currentMinute = Number(
      now.toLocaleTimeString('en-GB', {
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Karachi',
      }),
    );

    if (
      hour < currentHour ||
      (hour === currentHour && minute <= currentMinute)
    ) {
      return false;
    }
  }

  return true;
});

  return { date, availableSlots };
}
}