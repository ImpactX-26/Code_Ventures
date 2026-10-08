import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;
  private readonly fromEmail: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    this.fromEmail = process.env.EMAIL_FROM || 'EduPath AI <noreply@educaro-edupath.de>';

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
        this.isConfigured = true;
        this.logger.log(`SMTP configured successfully for: ${host}:${port}`);
      } catch (err) {
        this.logger.warn(`Failed to initialize SMTP transporter: ${(err as Error).message}. Dev console fallback active.`);
      }
    } else {
      this.logger.log('ℹ️ Running in Development Mode: Outgoing emails will be logged safely to server console.');
    }
  }

  async sendEmail(to: string, subject: string, html: string, textSnippet?: string): Promise<boolean> {
    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromEmail,
          to,
          subject,
          html,
        });
        this.logger.log(`📧 Email sent to ${to}: ${subject}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send email to ${to}: ${(error as Error).message}`);
        this.logConsoleEmail(to, subject, textSnippet || 'Email content generated');
        return false;
      }
    } else {
      this.logConsoleEmail(to, subject, textSnippet || 'Email content generated');
      return true;
    }
  }

  private logConsoleEmail(to: string, subject: string, snippet: string) {
    console.log('\n======================================================');
    console.log('📨 [EDUPATH AI EMAIL DISPATCHER - DEV CONSOLE MODE]');
    console.log(`TO:      ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`DETAILS:\n${snippet}`);
    console.log('======================================================\n');
  }

  async sendVerificationOtp(to: string, fullName: string, otp: string): Promise<void> {
    const subject = `[EduPath AI] Your 6-Digit Email Verification Code: ${otp}`;
    const textSnippet = `Hello ${fullName},\nYour Germany Journey verification OTP is: >>> ${otp} <<<\nExpires in 10 minutes.`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b132b; color: #f8fafc; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #38bdf8; margin: 0; font-size: 26px; letter-spacing: 1px;">EduPath AI</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Powered by Educaro — Your Intelligent Pathway to Germany</p>
        </div>
        <div style="background-color: #111e38; padding: 28px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.2);">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Welcome, ${fullName}!</h2>
          <p style="color: #cbd5e1; line-height: 1.6;">Thank you for taking the first step towards your education or career pathway in Germany. To activate your account and begin your AI-guided journey, please use the 6-digit verification code below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; background-color: #080d1a; color: #38bdf8; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 14px 28px; border-radius: 8px; border: 2px dashed #38bdf8;">
              ${otp}
            </span>
          </div>
          <p style="color: #94a3b8; font-size: 13px; text-align: center;">This code is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>
        </div>
        <div style="margin-top: 24px; text-align: center; color: #64748b; font-size: 12px;">
          <p>© 2026 Educaro — EduPath AI Applicant Journey. All rights reserved.</p>
        </div>
      </div>
    `;

    await this.sendEmail(to, subject, html, textSnippet);
  }

  async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    const subject = `[EduPath AI] Password Reset Request: ${otp}`;
    const textSnippet = `Password reset requested.\nYour Reset OTP is: >>> ${otp} <<<\nExpires in 15 minutes.`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b132b; color: #f8fafc; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #38bdf8;">Password Reset Request</h2>
        <p style="color: #cbd5e1;">We received a request to reset your password for your EduPath AI account. Use this one-time code to proceed:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 28px; font-weight: bold; color: #f59e0b; background: #111e38; padding: 12px 24px; border-radius: 6px; letter-spacing: 6px;">
            ${otp}
          </span>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `;

    await this.sendEmail(to, subject, html, textSnippet);
  }

  async sendQualificationNotice(to: string, applicantName: string, status: string, summary: string): Promise<void> {
    const subject = `[EduPath AI] Your Preliminary Germany Qualification Result: ${status}`;
    const textSnippet = `Preliminary Qualification Assessment for ${applicantName}:\nStatus: ${status}\nSummary: ${summary}`;
    const html = `
      <div style="font-family: sans-serif; background-color: #0b132b; color: #f8fafc; padding: 30px; border-radius: 10px;">
        <h2 style="color: #38bdf8;">Preliminary Qualification Update</h2>
        <p>Dear ${applicantName},</p>
        <p>The EduPath AI Qualification Engine has completed evaluating your profile against live German requirements.</p>
        <p><strong>Status:</strong> ${status}</p>
        <p>${summary}</p>
        <p>Log in to your dashboard to review missing requirements and your recommended next steps.</p>
      </div>
    `;
    await this.sendEmail(to, subject, html, textSnippet);
  }

  async sendRecommendationNotice(to: string, applicantName: string, step: string): Promise<void> {
    const subject = `[EduPath AI] Recommended Next Step: ${step}`;
    const textSnippet = `Recommended Next Action for ${applicantName}: ${step}`;
    const html = `
      <div style="font-family: sans-serif; background-color: #0b132b; color: #f8fafc; padding: 30px; border-radius: 10px;">
        <h2 style="color: #38bdf8;">Your Next Action on EduPath AI</h2>
        <p>Dear ${applicantName},</p>
        <p>The Recommendation Agent has generated your optimal next step:</p>
        <div style="background-color: #111e38; padding: 16px; border-radius: 6px; font-weight: bold; color: #38bdf8;">
          ${step}
        </div>
      </div>
    `;
    await this.sendEmail(to, subject, html, textSnippet);
  }
}
