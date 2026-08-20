import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { NotificationModule } from '../notification/notification.module';
import { PaymentService } from '../payment/payment.service';

@Module({
  imports: [NotificationModule],
  controllers: [AppointmentController],
  providers: [AppointmentService, PaymentService],
})
export class AppointmentModule { }