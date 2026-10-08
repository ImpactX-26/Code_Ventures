import { Module } from '@nestjs/common';
import { CvService } from './cv.service.js';
import { CvController } from './cv.controller.js';
import { ApplicantsModule } from '../applicants/applicants.module.js';

@Module({
  imports: [ApplicantsModule],
  controllers: [CvController],
  providers: [CvService],
  exports: [CvService],
})
export class CvModule {}

