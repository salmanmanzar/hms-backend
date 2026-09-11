import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendAppointmentConfirmation(
  to: string,
  name: string,
  scheduledAt: Date,
  otherPartyName: string,
  isDoctor: boolean,
) {
   const hours = scheduledAt.getUTCHours();
  const minutes = scheduledAt.getUTCMinutes();
  const day = scheduledAt.getUTCDate();
  const month = scheduledAt.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  const year = scheduledAt.getUTCFullYear();

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = String(minutes).padStart(2, '0');

  const formattedDate = `${month} ${day}, ${year} at ${displayHour}:${displayMinutes} ${period}`;

  const subject = 'Appointment Confirmation - HMS';
  const text = isDoctor
    ? `Dear Dr. ${name},\n\nYou have a new appointment scheduled with patient ${otherPartyName} on ${formattedDate}.\n\nRegards,\nHMS Team`
    : `Dear ${name},\n\nYour appointment with Dr. ${otherPartyName} has been scheduled on ${formattedDate}.\n\nRegards,\nHMS Team`;

  try {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
async sendStaffInvite(to: string, name: string, role: string, token: string) {
  const setupUrl = `${process.env.FRONTEND_URL}/setup-password?token=${token}`;

  const subject = 'Welcome to HMS - Set Up Your Account';
  const text = `Dear ${name},\n\nYou have been added to the Hospital Management System as a ${role}.\n\nUsername: ${to}\n\nPlease click the link below to set up your password (valid for 24 hours):\n${setupUrl}\n\nRegards,\nHMS Team`;

  try {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Failed to send invite email:', error);
  }
}

async sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = `${process.env.FRONTEND_URL}/setup-password?token=${token}`;

  const subject = 'Reset Your Password - HMS';
  const text = `Dear ${name},\n\nWe received a request to reset your password.\n\nPlease click the link below to set a new password (valid for 24 hours):\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n\nRegards,\nHMS Team`;

  try {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
}
async sendPatientInvite(to: string, name: string, token: string) {
  const setupUrl = `${process.env.FRONTEND_URL}/setup-password?token=${token}`;

  const subject = 'Welcome to HMS - Set Up Your Account';
  const text = `Dear ${name},\n\nYour account has been created at the Hospital Management System by our reception staff.\n\nUsername: ${to}\n\nPlease click the link below to set up your password (valid for 24 hours):\n${setupUrl}\n\nRegards,\nHMS Team`;

  try {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Failed to send patient invite email:', error);
  }
}

  async sendNewHospitalAlertToSuperAdmin(
    to: string,
    details: {
      hospitalName: string;
      adminName: string;
      adminEmail: string;
      address?: string;
      subscriptionPlan?: string;
    },
  ) {
    const portalUrl = `${process.env.FRONTEND_URL}/dashboard/super-admin`;
    const subject = `🔔 New Hospital Registration Request: ${details.hospitalName}`;

    const text = `Dear Super Admin,\n\nA new hospital has registered on the platform and is waiting for your review and approval.\n\n` +
      `Hospital Details:\n` +
      `• Hospital Name: ${details.hospitalName}\n` +
      `• Admin Name: ${details.adminName}\n` +
      `• Admin Email: ${details.adminEmail}\n` +
      `• Plan: ${details.subscriptionPlan || 'Basic'}\n` +
      `• Address: ${details.address || 'N/A'}\n\n` +
      `Please log in to your Super Admin portal to Accept or Reject this hospital:\n` +
      `${portalUrl}\n\n` +
      `Regards,\nHMS Notification System`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0f172a; margin: 0; font-size: 24px;">🏥 New Hospital Registration</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Action Required: Pending Super Admin Approval</p>
        </div>
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 140px;">Hospital Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${details.hospitalName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Admin Name:</td>
              <td style="padding: 6px 0;">${details.adminName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Admin Email:</td>
              <td style="padding: 6px 0;">${details.adminEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Plan:</td>
              <td style="padding: 6px 0; text-transform: capitalize;">${details.subscriptionPlan || 'Basic'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Address:</td>
              <td style="padding: 6px 0;">${details.address || 'N/A'}</td>
            </tr>
          </table>
        </div>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${portalUrl}" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 14px;">
            Review in Super Admin Portal
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
          Hospital Management System &bull; Automated Super Admin Alert
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      console.error('Failed to send super admin registration alert email:', error);
    }
  }

  async sendHospitalRegistrationReceived(to: string, adminName: string, hospitalName: string) {
    const subject = `Registration Received - ${hospitalName}`;

    const text = `Dear ${adminName},\n\nThank you for registering "${hospitalName}" with our Hospital Management System.\n\nYour application has been received and is currently pending review by our Super Admin team. You will receive an email notification as soon as your hospital registration is approved or updated.\n\nRegards,\nHMS Support Team`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0;">Registration Received</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Hospital: <strong>${hospitalName}</strong></p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Dear <strong>${adminName}</strong>,
        </p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Thank you for registering <strong>${hospitalName}</strong>. Your registration has been submitted and is currently pending review by our Super Admin team.
        </p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #15803d; font-size: 14px;">
            ⏳ <strong>Status: Pending Review</strong><br/>
            You will receive a confirmation email once your account is approved.
          </p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          Hospital Management System &bull; Support Team
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      console.error('Failed to send registration received email:', error);
    }
  }

  async sendHospitalApprovalEmail(to: string, adminName: string, hospitalName: string) {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const subject = `🎉 Congratulations! Your Hospital ${hospitalName} Has Been Approved`;

    const text = `Dear ${adminName},\n\nGreat news! Your hospital "${hospitalName}" registration has been approved by the Super Admin.\n\nYou can now log in to your Hospital Admin portal using your registered credentials:\n${loginUrl}\n\nRegards,\nHMS Team`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #15803d; margin: 0;">🎉 Registration Approved!</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Hospital: <strong>${hospitalName}</strong></p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Dear <strong>${adminName}</strong>,
        </p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          We are pleased to inform you that your registration for <strong>${hospitalName}</strong> has been officially approved by the Super Admin!
        </p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Your admin account is now active. You can log in to your dashboard to manage departments, staff, doctors, appointments, and hospital operations.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${loginUrl}" style="background-color: #15803d; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 15px;">
            Log In to Hospital Admin Portal
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          Hospital Management System &bull; Support Team
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      console.error('Failed to send hospital approval email:', error);
    }
  }

  async sendHospitalRejectionEmail(to: string, adminName: string, hospitalName: string, reason?: string) {
    const subject = `Update Regarding Your Hospital Registration - ${hospitalName}`;

    const text = `Dear ${adminName},\n\nWe regret to inform you that your registration request for "${hospitalName}" has been rejected by the Super Admin.\n\n${reason ? `Reason: ${reason}\n\n` : ''}If you believe this is an error or would like further information, please contact our support team.\n\nRegards,\nHMS Support Team`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #b91c1c; margin: 0;">Registration Status Update</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Hospital: <strong>${hospitalName}</strong></p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Dear <strong>${adminName}</strong>,
        </p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          We regret to inform you that your registration request for <strong>${hospitalName}</strong> has been reviewed and rejected by the Super Admin.
        </p>
        ${reason ? `
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 0; color: #991b1b; font-size: 14px;">
            <strong>Reason:</strong> ${reason}
          </p>
        </div>` : ''}
        <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
          If you believe this was in error or if you have any questions, please contact our support team at ${process.env.EMAIL_USER || 'support@hms.com'}.
        </p>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          Hospital Management System &bull; Support Team
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      console.error('Failed to send hospital rejection email:', error);
    }
  }
}
