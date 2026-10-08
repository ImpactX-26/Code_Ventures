import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module.js';
import { EmailModule } from './email/email.module.js';
import { AiModule } from './ai/ai.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ApplicantsModule } from './applicants/applicants.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { WebResearchModule } from './web-research/web-research.module.js';
import { ClarificationModule } from './clarification/clarification.module.js';
import { VideoModule } from './video/video.module.js';
import { QualificationModule } from './qualification/qualification.module.js';
import { RecommendationsModule } from './recommendations/recommendations.module.js';
import { CvModule } from './cv/cv.module.js';
import { ConsultantModule } from './consultant/consultant.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    EmailModule,
    AiModule,
    AuthModule,
    ApplicantsModule,
    DocumentsModule,
    WebResearchModule,
    ClarificationModule,
    VideoModule,
    QualificationModule,
    RecommendationsModule,
    CvModule,
    ConsultantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
