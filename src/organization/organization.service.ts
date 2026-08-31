import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) { }

  async findPending() {
    return this.prisma.organization.findMany({
      where: { status: 'pending' },
      include: { users: { where: { role: 'admin' }, select: { name: true, email: true } } },
    });
  }

  async findApproved() {
    return this.prisma.organization.findMany({
      where: { status: 'approved' },
    });
  }

  async approve(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    if (org.status !== 'pending') {
      throw new BadRequestException('Organization is not pending approval');
    }

    await this.prisma.organization.update({
      where: { id },
      data: { status: 'approved' },
    });

    await this.prisma.user.updateMany({
      where: { organizationId: id, role: 'admin' },
      data: { isActive: true },
    });

    return { message: 'Organization approved successfully' };
  }

  async reject(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    await this.prisma.organization.update({
      where: { id },
      data: { status: 'rejected' },
    });

    return { message: 'Organization rejected' };
  }
}