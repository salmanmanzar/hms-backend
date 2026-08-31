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
}