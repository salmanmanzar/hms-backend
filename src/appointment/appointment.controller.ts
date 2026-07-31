import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('appointment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
@Roles('patient', 'receptionist')
create(@Req() req, @Body() dto: CreateAppointmentDto) {
  return this.appointmentService.create(req.user.userId, req.user.role, dto);
}
 @Get()
@Roles('admin', 'receptionist', 'doctor')
findAll(@Req() req) {
  return this.appointmentService.findAll(req.user);
}



  @Get(':id')
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  findOne(@Param('id') id: string, @Req() req) {
    return this.appointmentService.findOne(id, req.user);
  }

  @Patch(':id/status')
  @Roles('doctor', 'receptionist')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.appointmentService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles('admin', 'receptionist')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(id);
  }
}