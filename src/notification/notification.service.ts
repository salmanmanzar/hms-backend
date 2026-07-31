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
}
