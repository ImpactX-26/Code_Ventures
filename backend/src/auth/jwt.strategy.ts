import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../database/prisma.service.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'educaro_super_secure_jwt_secret_key_2026_hackathon',
    });
  }

  async validate(payload: JwtPayload) {
    if (this.prisma.isConnected) {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { applicant: true },
      });
      if (!user) {
        throw new UnauthorizedException('User session no longer valid');
      }
      return user;
    }

    // In-memory / Fallback user validation if DB disconnected
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      status: 'ACTIVE',
      emailVerified: true,
      applicant: { id: `app-${payload.sub}`, userId: payload.sub },
    };
  }
}
