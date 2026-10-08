import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service.js';
import { RecommendationsController } from './recommendations.controller.js';

@Module({
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
