import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NotificationService } from '../notification/notification.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'temporary-secret-change-later',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy, NotificationService],
})
export class AuthModule {}