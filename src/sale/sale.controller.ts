import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('sale')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  @Roles('pharmacist', 'admin')
  create(@Body() dto: CreateSaleDto) {
    return this.saleService.create(dto);
  }

  @Get()
  @Roles('admin', 'pharmacist')
  findAll() {
    return this.saleService.findAll();
  }
}