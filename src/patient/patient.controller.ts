import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AddMedicalRecordDto } from './dto/add-medical-record.dto';

@Controller('patient')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @Roles('patient', 'receptionist', 'admin')
  create(@Req() req, @Body() createPatientDto: CreatePatientDto) {
    return this.patientService.create(req.user.userId, createPatientDto);
  }

  @Get()
  @Roles('admin', 'receptionist', 'doctor')
  findAll() {
    return this.patientService.findAll();
  }

  @Get('me/profile')
@Roles('patient')
getMyProfile(@Req() req) {
  return this.patientService.findByUserId(req.user.userId);
}


@Get('search/by-email')
@Roles('receptionist', 'admin', 'pharmacist')
findByEmail(@Query('email') email: string) {
  return this.patientService.findByEmail(email);
}
@Post(':id/medical-record')
@Roles('doctor', 'admin')
addMedicalRecord(@Param('id') id: string, @Body() dto: AddMedicalRecordDto) {
  return this.patientService.addMedicalRecord(id, dto);
}
@Get('me/search')
@Roles('doctor')
searchMyPatients(@Req() req, @Query('search') search?: string) {
  return this.patientService.searchMyPatients(req.user.userId, search);
}



@Get(':id/history')
@Roles('admin', 'receptionist', 'doctor', 'patient')
getHistory(@Param('id') id: string) {
  return this.patientService.getHistory(id);
}

  @Get(':id')
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  findOne(@Param('id') id: string, @Req() req) {
    return this.patientService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('admin', 'receptionist', 'patient')
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.patientService.remove(id);
  }
}