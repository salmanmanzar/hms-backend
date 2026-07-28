import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PatientModule } from './patient/patient.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { AppointmentModule } from './appointment/appointment.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { InvoiceModule } from './invoice/invoice.module';
import { MedicineModule } from './medicine/medicine.module';
import { NotificationModule } from './notification/notification.module';
import { DepartmentModule } from './department/department.module';

@Module({
  imports: [PrismaModule, PatientModule, UserModule, AuthModule, DoctorModule, AppointmentModule, PrescriptionModule, InvoiceModule, MedicineModule, NotificationModule, DepartmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
