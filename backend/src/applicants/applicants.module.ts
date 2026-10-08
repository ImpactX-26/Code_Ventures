import { Module } from '@nestjs/common';
import { ApplicantsService } from './applicants.service.js';
import { ApplicantsController } from './applicants.controller.js';

@Module({
  controllers: [ApplicantsController],
  providers: [ApplicantsService],
  exports: [ApplicantsService],
})
export class ApplicantsModule {}
