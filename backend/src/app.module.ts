import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { RecommendationsModule } from './recommendations/recommendations.module.js';
import { ApplicantsModule } from './applicants/applicants.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { MediaModule } from './media/media.module.js';
import { AgentModule } from './agent/agent.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RecommendationsModule,
    ApplicantsModule,
    DocumentsModule,
    MediaModule,
    AgentModule,
  ],
})
export class AppModule {}
