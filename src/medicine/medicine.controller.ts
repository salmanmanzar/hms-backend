import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePlan } from '../auth/decorators/require-plan.decorator';


@Controller('medicine')
@UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard)
@RequirePlan('professional')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) { }

  @Post()
  @Roles('pharmacist', 'admin')
  create(@Body() dto: CreateMedicineDto, @Req() req) {
    return this.medicineService.create(dto, req.user.organizationId);
  }

  @Get()
  @Roles('admin', 'pharmacist', 'doctor', 'receptionist')
  findAll(@Req() req) {
    const organizationId = req.user.role === 'super_admin' ? null : req.user.organizationId;
    return this.medicineService.findAll(organizationId);
  }

  @Get('by-code/:code')
  @Roles('admin', 'pharmacist')
  findByCode(@Param('code') code: string, @Req() req) {
    const organizationId = req.user.role === 'super_admin' ? null : req.user.organizationId;
    return this.medicineService.findByCode(code, organizationId);
  }

  @Get(':id')
  @Roles('admin', 'pharmacist', 'doctor', 'receptionist')
  findOne(@Param('id') id: string) {
    return this.medicineService.findOne(id);
  }

  @Patch(':id')
  @Roles('pharmacist', 'admin')
  update(@Param('id') id: string, @Body() dto: UpdateMedicineDto) {
    return this.medicineService.update(id, dto);
  }

  @Patch(':id/stock')
  @Roles('pharmacist', 'admin')
  updateStock(@Param('id') id: string, @Body('quantityChange') quantityChange: number) {
    return this.medicineService.updateStock(id, quantityChange);
  }
}