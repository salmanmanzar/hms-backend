import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('prescription')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @Roles('doctor')
  create(@Body() dto: CreatePrescriptionDto) {
    return this.prescriptionService.create(dto);
  }

  @Get(':id')
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  findOne(@Param('id') id: string) {
    return this.prescriptionService.findOne(id);
  }

  @Get('appointment/:appointmentId')
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  findByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.prescriptionService.findByAppointment(appointmentId);
  }
}