import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { Query } from '@nestjs/common';

@Controller('doctor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @Roles('doctor', 'admin')
  create(@Req() req, @Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create(req.user.userId, createDoctorDto);
  }

  @Get()
@Roles('admin', 'receptionist', 'patient', 'doctor')
findAll(@Query('search') search?: string) {
  return this.doctorService.findAll(search);
}

  @Get(':id')
  @Roles('admin', 'receptionist', 'patient', 'doctor')
  findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'doctor')
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.doctorService.remove(id);
  }
  @Patch(':id/availability')
  @Roles('doctor', 'admin')
setAvailability(@Param('id') id: string, @Body() dto: SetAvailabilityDto) {
  return this.doctorService.setAvailability(id, dto.availability);
}
@Get(':id/available-slots')
@Roles('admin', 'receptionist', 'patient', 'doctor')
getAvailableSlots(@Param('id') id: string, @Query('date') date: string) {
  return this.doctorService.getAvailableSlots(id, date);
}
}