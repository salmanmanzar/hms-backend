import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('department')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) { }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateDepartmentDto, @Req() req) {
    return this.departmentService.create(dto, req.user.organizationId);
  }

  @Get()
  @Roles('admin', 'doctor', 'receptionist', 'patient')
  findAll(@Req() req) {
    const organizationId = req.user.role === 'super_admin' ? null : req.user.organizationId;
    return this.departmentService.findAll(organizationId);
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'receptionist', 'patient')
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: CreateDepartmentDto, @Req() req) {
    const organizationId = req.user.role === 'super_admin' ? null : req.user.organizationId;
    return this.departmentService.update(id, dto, organizationId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string, @Req() req) {
    const organizationId = req.user.role === 'super_admin' ? null : req.user.organizationId;
    return this.departmentService.remove(id, organizationId);
  }
}