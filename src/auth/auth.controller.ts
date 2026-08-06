import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { SetupPasswordDto } from './dto/setup-password.dto';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('create-staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createStaff(@Body() dto: CreateStaffDto) {
    return this.authService.createStaff(dto);
  }

  @Post('forgot-password')
async forgotPassword(@Body() dto: ForgotPasswordDto) {
  return this.authService.forgotPassword(dto.email);
}

  @Post('setup-password')
  async setupPassword(@Body() dto: SetupPasswordDto) {
    return this.authService.setupPassword(dto.token, dto.password);
  }

  @Post('register-patient')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('receptionist', 'admin')
  async registerPatient(@Body() dto: RegisterPatientDto) {
    return this.authService.registerPatientByStaff(dto);
  }
}