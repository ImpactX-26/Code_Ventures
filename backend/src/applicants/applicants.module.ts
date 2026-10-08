import { Module } from '@nestjs/common';
import { ApplicantsService } from './applicants.service.js';
import { ApplicantsController } from './applicants.controller.js';
import { RecommendationsModule } from '../recommendations/recommendations.module.js';

@Module({
  imports: [RecommendationsModule],
  controllers: [ApplicantsController],
  providers: [ApplicantsService],
  exports: [ApplicantsService],
})
export class ApplicantsModule {}
