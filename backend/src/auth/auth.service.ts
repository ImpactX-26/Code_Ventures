import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../database/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import {
  RegisterDto,
  VerifyEmailDto,
  ResendVerificationDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto.js';
import { UserRole, UserStatus } from '@prisma/client';

interface InMemUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  applicantId: string;
  createdAt: Date;
}

interface InMemToken {
  id: string;
  userId: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Resilient memory store for offline/local development when DB is unconfigured
  private memUsers: Map<string, InMemUser> = new Map();
  private memTokens: Map<string, InMemToken> = new Map();
  private memResetTokens: Map<string, InMemToken> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {
    // Seed default consultant in-memory
    const consultantId = 'consultant-admin-id';
    this.memUsers.set('consultant@educaro.de', {
      id: consultantId,
      email: 'consultant@educaro.de',
      passwordHash: bcrypt.hashSync('ConsultantPass123!', 10),
      fullName: 'Educaro Senior Consultant',
      role: UserRole.CONSULTANT,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      applicantId: 'app-consultant',
      createdAt: new Date(),
    });
  }

  private generate6DigitOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const email = dto.email.toLowerCase().trim();

    // Check existing
    if (this.prisma.isConnected) {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new BadRequestException('An account with this email address already exists');
      }
    } else {
      if (this.memUsers.has(email)) {
        throw new BadRequestException('An account with this email address already exists');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const otp = this.generate6DigitOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let userId = uuidv4();
    let applicantId = uuidv4();

    if (this.prisma.isConnected) {
      try {
        const user = await this.prisma.user.create({
          data: {
            email,
            passwordHash,
            role: UserRole.APPLICANT,
            status: UserStatus.EMAIL_VERIFICATION_PENDING,
            emailVerified: false,
            applicant: {
              create: {
                fullName: dto.fullName,
              },
            },
          },
          include: { applicant: true },
        });

        userId = user.id;
        applicantId = user.applicant?.id || applicantId;

        await this.prisma.emailVerificationToken.create({
          data: {
            userId,
            otp,
            expiresAt,
            attempts: 0,
          },
        });
      } catch (err) {
        this.logger.error(`Database error during registration: ${(err as Error).message}`);
        throw new BadRequestException('Could not complete registration. Please check database connection.');
      }
    } else {
      // Memory store fallback
      this.memUsers.set(email, {
        id: userId,
        email,
        passwordHash,
        fullName: dto.fullName,
        role: UserRole.APPLICANT,
        status: UserStatus.EMAIL_VERIFICATION_PENDING,
        emailVerified: false,
        applicantId,
        createdAt: new Date(),
      });

      this.memTokens.set(userId, {
        id: uuidv4(),
        userId,
        otp,
        expiresAt,
        attempts: 0,
        createdAt: new Date(),
      });
    }

    // Send verification email / log OTP in console
    await this.emailService.sendVerificationOtp(email, dto.fullName, otp);

    return {
      message: "We've sent a 6-digit verification code to your email.",
      email,
      status: UserStatus.EMAIL_VERIFICATION_PENDING,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const email = dto.email.toLowerCase().trim();
    const inputOtp = dto.otp.trim();

    if (this.prisma.isConnected) {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { applicant: true },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.emailVerified && user.status === UserStatus.ACTIVE) {
        const token = this.generateToken(user.id, user.email, user.role);
        return {
          message: 'Email is already verified.',
          accessToken: token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.applicant?.fullName,
            emailVerified: true,
          },
          applicantId: user.applicant?.id,
        };
      }

      const tokenRecord = await this.prisma.emailVerificationToken.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      if (!tokenRecord) {
        throw new BadRequestException('No verification code found. Please request a new code.');
      }

      if (new Date() > tokenRecord.expiresAt) {
        throw new BadRequestException('Verification code has expired. Please request a new code.');
      }

      if (tokenRecord.attempts >= 5) {
        throw new BadRequestException('Too many failed verification attempts. Please request a new code.');
      }

      if (tokenRecord.otp !== inputOtp) {
        await this.prisma.emailVerificationToken.update({
          where: { id: tokenRecord.id },
          data: { attempts: { increment: 1 } },
        });
        throw new BadRequestException('Invalid verification code. Please check and try again.');
      }

      // Valid OTP -> Activate account
      await this.prisma.emailVerificationToken.deleteMany({
        where: { userId: user.id },
      });

      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          status: UserStatus.ACTIVE,
        },
        include: { applicant: true },
      });

      const accessToken = this.generateToken(updatedUser.id, updatedUser.email, updatedUser.role);

      return {
        message: 'Email verified successfully! Welcome to your Germany journey.',
        accessToken,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          fullName: updatedUser.applicant?.fullName,
          emailVerified: true,
        },
        applicantId: updatedUser.applicant?.id,
      };
    } else {
      // In-memory verification
      const user = this.memUsers.get(email);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const tokenRecord = this.memTokens.get(user.id);
      if (!tokenRecord) {
        throw new BadRequestException('No verification code found. Please request a new code.');
      }

      if (new Date() > tokenRecord.expiresAt) {
        throw new BadRequestException('Verification code has expired. Please request a new code.');
      }

      if (tokenRecord.attempts >= 5) {
        throw new BadRequestException('Too many failed verification attempts. Please request a new code.');
      }

      if (tokenRecord.otp !== inputOtp) {
        tokenRecord.attempts += 1;
        throw new BadRequestException('Invalid verification code. Please check and try again.');
      }

      user.emailVerified = true;
      user.status = UserStatus.ACTIVE;
      this.memTokens.delete(user.id);

      const accessToken = this.generateToken(user.id, user.email, user.role);

      return {
        message: 'Email verified successfully! Welcome to your Germany journey.',
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          emailVerified: true,
        },
        applicantId: user.applicantId,
      };
    }
  }

  async resendVerification(dto: ResendVerificationDto) {
    const email = dto.email.toLowerCase().trim();

    if (this.prisma.isConnected) {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { applicant: true },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.emailVerified) {
        throw new BadRequestException('Email is already verified. Please proceed to login.');
      }

      // Cooldown check (60s)
      const lastToken = await this.prisma.emailVerificationToken.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      if (lastToken && Date.now() - lastToken.createdAt.getTime() < 60000) {
        const remainingSeconds = Math.ceil((60000 - (Date.now() - lastToken.createdAt.getTime())) / 1000);
        throw new BadRequestException(`Please wait ${remainingSeconds} seconds before requesting a new code.`);
      }

      await this.prisma.emailVerificationToken.deleteMany({
        where: { userId: user.id },
      });

      const otp = this.generate6DigitOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await this.prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          otp,
          expiresAt,
          attempts: 0,
        },
      });

      await this.emailService.sendVerificationOtp(email, user.applicant?.fullName || 'Applicant', otp);

      return {
        message: 'A new 6-digit verification code has been sent to your email.',
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
      };
    } else {
      const user = this.memUsers.get(email);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const lastToken = this.memTokens.get(user.id);
      if (lastToken && Date.now() - lastToken.createdAt.getTime() < 60000) {
        const remainingSeconds = Math.ceil((60000 - (Date.now() - lastToken.createdAt.getTime())) / 1000);
        throw new BadRequestException(`Please wait ${remainingSeconds} seconds before requesting a new code.`);
      }

      const otp = this.generate6DigitOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      this.memTokens.set(user.id, {
        id: uuidv4(),
        userId: user.id,
        otp,
        expiresAt,
        attempts: 0,
        createdAt: new Date(),
      });

      await this.emailService.sendVerificationOtp(email, user.fullName, otp);

      return {
        message: 'A new 6-digit verification code has been sent to your email.',
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
      };
    }
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();

    if (this.prisma.isConnected) {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { applicant: true },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!user.emailVerified || user.status === UserStatus.EMAIL_VERIFICATION_PENDING) {
        throw new ForbiddenException({
          message: 'Please verify your email before continuing.',
          emailNotVerified: true,
          email: user.email,
        });
      }

      const accessToken = this.generateToken(user.id, user.email, user.role);

      return {
        message: 'Logged in successfully',
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.applicant?.fullName,
          emailVerified: user.emailVerified,
        },
        applicantId: user.applicant?.id,
      };
    } else {
      const user = this.memUsers.get(email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!user.emailVerified || user.status === UserStatus.EMAIL_VERIFICATION_PENDING) {
        throw new ForbiddenException({
          message: 'Please verify your email before continuing.',
          emailNotVerified: true,
          email: user.email,
        });
      }

      const accessToken = this.generateToken(user.id, user.email, user.role);

      return {
        message: 'Logged in successfully',
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          emailVerified: user.emailVerified,
        },
        applicantId: user.applicantId,
      };
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase().trim();

    // Do not reveal whether user exists
    const genericResponse = {
      message: 'If an account with this email exists, a password reset code has been sent.',
    };

    let userExists = false;
    let userId = '';

    if (this.prisma.isConnected) {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        userExists = true;
        userId = user.id;
      }
    } else {
      const user = this.memUsers.get(email);
      if (user) {
        userExists = true;
        userId = user.id;
      }
    }

    if (!userExists) {
      return genericResponse;
    }

    const otp = this.generate6DigitOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    if (this.prisma.isConnected) {
      await this.prisma.passwordResetToken.create({
        data: {
          userId,
          token: otp,
          expiresAt,
          used: false,
        },
      });
    } else {
      this.memResetTokens.set(userId, {
        id: uuidv4(),
        userId,
        otp,
        expiresAt,
        attempts: 0,
        createdAt: new Date(),
      });
    }

    await this.emailService.sendPasswordResetOtp(email, otp);

    return genericResponse;
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const email = dto.email.toLowerCase().trim();
    const inputOtp = dto.otp.trim();

    if (this.prisma.isConnected) {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new BadRequestException('Invalid or expired reset code');
      }

      const tokenRecord = await this.prisma.passwordResetToken.findFirst({
        where: {
          userId: user.id,
          token: inputOtp,
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!tokenRecord) {
        throw new BadRequestException('Invalid or expired reset code');
      }

      const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      });

      await this.prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { used: true },
      });

      return {
        message: 'Password has been successfully updated. You may now log in with your new password.',
      };
    } else {
      const user = this.memUsers.get(email);
      if (!user) {
        throw new BadRequestException('Invalid or expired reset code');
      }

      const tokenRecord = this.memResetTokens.get(user.id);
      if (!tokenRecord || tokenRecord.otp !== inputOtp || new Date() > tokenRecord.expiresAt) {
        throw new BadRequestException('Invalid or expired reset code');
      }

      user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
      this.memResetTokens.delete(user.id);

      return {
        message: 'Password has been successfully updated. You may now log in with your new password.',
      };
    }
  }

  async getMe(userId: string) {
    if (this.prisma.isConnected) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          applicant: {
            include: {
              goals: true,
              educationRecords: true,
              employmentRecords: true,
              applicantSkills: true,
              applicantLanguages: true,
              documents: true,
              clarificationTasks: { where: { status: 'PENDING' } },
              qualificationAssessments: { orderBy: { createdAt: 'desc' }, take: 1 },
              recommendations: { where: { status: 'ACTIVE' }, take: 1 },
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        applicant: user.applicant,
      };
    } else {
      // In-memory user lookup
      let foundUser: InMemUser | undefined;
      for (const u of this.memUsers.values()) {
        if (u.id === userId) {
          foundUser = u;
          break;
        }
      }

      if (!foundUser) {
        return {
          id: userId,
          email: 'applicant@educaro-dev.de',
          role: UserRole.APPLICANT,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          applicant: {
            id: `app-${userId}`,
            userId,
            fullName: 'Applicant',
            profileCompleteness: 50,
          },
        };
      }

      return {
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
        status: foundUser.status,
        emailVerified: foundUser.emailVerified,
        applicant: {
          id: foundUser.applicantId,
          userId: foundUser.id,
          fullName: foundUser.fullName,
          profileCompleteness: 0,
        },
      };
    }
  }

  private generateToken(userId: string, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }
}
