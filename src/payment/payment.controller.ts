import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payment')
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService,
        private readonly prisma: PrismaService,
    ) { }

    @Post('subscription-intent')
    async createSubscriptionIntent(@Body('plan') plan: string) {
        const prices: Record<string, number> = {
            basic: 5000,
            professional: 10000,
            enterprise: 20000,
        };
        const amount = prices[plan] || 5000;
        return this.paymentService.createPaymentIntent(amount);
    }

    @Post('create-intent')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('patient', 'receptionist')
    async createIntent(@Body('doctorId') doctorId: string) {
        const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
        if (!doctor) {
            throw new NotFoundException('Doctor not found');
        }
        return this.paymentService.createPaymentIntent(doctor.consultationFee);
    }
}