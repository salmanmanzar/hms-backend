import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { PatientService } from '../patient/patient.service';  
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
    private patientService: PatientService,
  ) {}

  async register(data: { name: string; email: string; password: string }) {
    const existingUser = await this.userService.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userService.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: 'patient',
      isActive: true,
    });

    const { password, ...result } = user;
    return result;
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userService.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Please set up your password using the invite link sent to your email');
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async createStaff(data: { name: string; email: string; role: string }) {
    const existingUser = await this.userService.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const placeholderPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

    const user = await this.userService.create({
      name: data.name,
      email: data.email,
      password: placeholderPassword,
      role: data.role,
      isActive: false,
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userService.setInviteToken(user.id, token, expiry);

    await this.notificationService.sendStaffInvite(user.email, user.name, user.role, token);

    const { password, ...result } = user;
    return result;
  }

  async setupPassword(token: string, newPassword: string) {
    const user = await this.userService.findByInviteToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired invite link');
    }

    if (!user.inviteTokenExpiry || user.inviteTokenExpiry < new Date()) {
      throw new BadRequestException('This invite link has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.setupPassword(user.id, hashedPassword);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async registerPatientByStaff(data: {
  name: string;
  email: string;
  dob: string;
  gender: string;
  bloodGroup?: string;
  address?: string;
}) {
  const existingUser = await this.userService.findByEmail(data.email);
  if (existingUser) {
    throw new ConflictException('Email already registered');
  }

  const placeholderPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

  const user = await this.userService.create({
    name: data.name,
    email: data.email,
    password: placeholderPassword,
    role: 'patient',
    isActive: false,
  });

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await this.userService.setInviteToken(user.id, token, expiry);

  await this.patientService.create(user.id, {
    dob: data.dob,
    gender: data.gender,
    bloodGroup: data.bloodGroup,
    address: data.address,
  });

  await this.notificationService.sendPatientInvite(user.email, user.name, token);

  return { message: 'Patient registered successfully. An invite email has been sent.' };
}
}