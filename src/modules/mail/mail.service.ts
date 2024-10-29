import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { appConfig } from '../../configuration/app.config';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: appConfig.emailUser,
      pass: appConfig.emailPassword,
    },
  });

  async sendVerificationEmail(email: string, code: string) {
    await this.transporter.sendMail({
      from: appConfig.emailUser,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}`,
    });
  }
  
  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: appConfig.emailUser,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl}. If you didn’t request this, please ignore this email.`,
    });
  }
}