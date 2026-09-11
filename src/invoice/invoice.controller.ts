import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePlan } from '../auth/decorators/require-plan.decorator';

@Controller('invoice')
@UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard)
@RequirePlan('professional')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @Roles('receptionist', 'admin')
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(dto);
  }

  @Get(':id')
  @Roles('admin', 'receptionist', 'patient')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Patch(':id/pay')
  @Roles('receptionist', 'admin')
  markAsPaid(@Param('id') id: string) {
    return this.invoiceService.markAsPaid(id);
  }
}