import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { PatientService } from '../patient/patient.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
@Injectable()




export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
    private patientService: PatientService,
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) { }

  async register(data: { name: string; email: string; password: string; organizationId: string }) {
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
      organizationId: data.organizationId,
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

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }



  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await this.userService.setInviteToken(user.id, token, expiry);
      await this.notificationService.sendPasswordResetEmail(user.email, user.name, token);
    }

    return { message: 'If an account with this email exists, a reset link has been sent.' };
  }

  async createStaff(
    data: { name: string; email: string; role: string },
    adminOrganizationId: string | null,
    adminUser?: { userId: string; email: string; role: string },
  ) {
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
      organizationId: adminOrganizationId,
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userService.setInviteToken(user.id, token, expiry);

    await this.notificationService.sendStaffInvite(user.email, user.name, user.role, token);

    // ── Immutable audit log: staff was invited ──
    if (adminOrganizationId) {
      await this.auditLog.log({
        organizationId: adminOrganizationId,
        actorId: adminUser?.userId,
        actorName: adminUser?.email,
        actorRole: adminUser?.role ?? 'admin',
        targetId: user.id,
        targetName: user.name,
        targetRole: user.role,
        action: 'STAFF_INVITED',
        metadata: { email: user.email },
      });
    }

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

    // ── Immutable audit log: staff has joined ──
    if (user.organizationId) {
      await this.auditLog.log({
        organizationId: user.organizationId,
        targetId: user.id,
        targetName: user.name,
        targetRole: user.role,
        action: 'STAFF_JOINED',
        metadata: { email: user.email },
      });
    }

    const payload = { sub: user.id, email: user.email, role: user.role, organizationId: user.organizationId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }
  async registerOrganization(data: {
    adminName: string;
    adminEmail: string;
    password: string;
    organizationName: string;
    address?: string;
  }) {
    const existingUser = await this.userService.findByEmail(data.adminEmail);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const organization = await this.prisma.organization.create({
      data: {
        name: data.organizationName,
        address: data.address,
        status: 'pending',
      },
    });

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.adminName,
        email: data.adminEmail,
        password: hashedPassword,
        role: 'admin',
        organizationId: organization.id,
        isActive: false,
      },
    });

    return {
      message: 'Your hospital registration has been submitted for approval. You will be notified once approved.',
    };
  }

  async getApprovedOrganizations() {
    return this.prisma.organization.findMany({
      where: { status: 'approved' },
      select: { id: true, name: true },
    });
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
  async getMyOrganization(userId: string) {
    const user = await this.userService.findById(userId);

    if (!user || !user.organizationId) {
      return null;
    }

    return this.prisma.organization.findUnique({
      where: {
        id: user.organizationId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        status: true,
      },
    });
  }
}
