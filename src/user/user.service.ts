import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; email: string; password: string; role: string; isActive?: boolean }) {
    return this.prisma.user.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByInviteToken(token: string) {
    return this.prisma.user.findUnique({ where: { inviteToken: token } });
  }

  async setupPassword(userId: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        isActive: true,
        inviteToken: null,
        inviteTokenExpiry: null,
      },
    });
  }

  async setInviteToken(userId: string, token: string, expiry: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        inviteToken: token,
        inviteTokenExpiry: expiry,
      },
    });
  }
}