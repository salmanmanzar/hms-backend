import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class OrganizationService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) { }

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
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: { users: { where: { role: 'admin' } } },
    });
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

    // Send approval email to hospital admin(s)
    try {
      for (const admin of org.users) {
        if (admin.email) {
          await this.notificationService.sendHospitalApprovalEmail(
            admin.email,
            admin.name,
            org.name,
          );
        }
      }
    } catch (err) {
      console.error('Error sending approval email to hospital admin:', err);
    }

    return { message: 'Organization approved successfully' };
  }

  async reject(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: { users: { where: { role: 'admin' } } },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    await this.prisma.organization.update({
      where: { id },
      data: { status: 'rejected' },
    });

    // Send rejection email to hospital admin(s)
    try {
      for (const admin of org.users) {
        if (admin.email) {
          await this.notificationService.sendHospitalRejectionEmail(
            admin.email,
            admin.name,
            org.name,
          );
        }
      }
    } catch (err) {
      console.error('Error sending rejection email to hospital admin:', err);
    }

    return { message: 'Organization rejected' };
  }
}