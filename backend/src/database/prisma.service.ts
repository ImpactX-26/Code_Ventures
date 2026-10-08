import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isConnected = false;

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('Connecting to PostgreSQL / Neon database...');
      await this.$connect();
      this.isConnected = true;
      this.logger.log('✅ Successfully connected to PostgreSQL / Neon database!');
    } catch (error) {
      this.isConnected = false;
      this.logger.warn(
        `⚠️ Database connection note: Could not connect to DATABASE_URL. Running with resilient local fallback for development/demo mode until Neon credentials are connected. (Details: ${(error as Error).message})`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
    }
  }
}
