import { Module } from '@nestjs/common';
import { WebResearchService } from './web-research.service.js';
import { WebResearchController } from './web-research.controller.js';

@Module({
  controllers: [WebResearchController],
  providers: [WebResearchService],
  exports: [WebResearchService],
})
export class WebResearchModule {}
