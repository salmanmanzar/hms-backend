import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateDepartmentDto, organizationId: string) {
    const existing = await this.prisma.department.findFirst({
      where: { name: dto.name, organizationId },
    });
    if (existing) {
      throw new ConflictException('Department already exists in your organization');
    }
    return this.prisma.department.create({ data: { ...dto, organizationId } });
  }

  async findAll(organizationId?: string | null) {
    return this.prisma.department.findMany({
      where: organizationId ? { organizationId } : {},
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) {
      throw new NotFoundException('Department not found');
    }
    return department;
  }

  async update(id: string, dto: CreateDepartmentDto, organizationId?: string | null) {
    const department = await this.findOne(id);
    if (organizationId && department.organizationId !== organizationId) {
      throw new NotFoundException('Department not found in your organization');
    }

    const existing = await this.prisma.department.findFirst({
      where: { name: dto.name, organizationId: department.organizationId, id: { not: id } },
    });
    if (existing) {
      throw new ConflictException('Another department with this name already exists');
    }

    return this.prisma.department.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async remove(id: string, organizationId?: string | null) {
    const department = await this.findOne(id);
    if (organizationId && department.organizationId !== organizationId) {
      throw new NotFoundException('Department not found in your organization');
    }

    // Check if doctors are assigned to this department
    const doctorCount = await this.prisma.doctor.count({
      where: { departmentId: id },
    });

    if (doctorCount > 0) {
      throw new ConflictException(`Cannot delete department with ${doctorCount} assigned doctor(s)`);
    }

    return this.prisma.department.delete({ where: { id } });
  }
}