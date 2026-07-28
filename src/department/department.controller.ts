import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('department')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.create(dto);
  }

  @Get()
  @Roles('admin', 'doctor', 'receptionist', 'patient')
  findAll() {
    return this.departmentService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'receptionist', 'patient')
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }
}