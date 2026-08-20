import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService,
        private readonly prisma: PrismaService,
    ) { }

    @Post('create-intent')
    @Roles('patient', 'receptionist')
    async createIntent(@Body('doctorId') doctorId: string) {
        const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
        if (!doctor) {
            throw new NotFoundException('Doctor not found');
        }
        return this.paymentService.createPaymentIntent(doctor.consultationFee);
    }
}