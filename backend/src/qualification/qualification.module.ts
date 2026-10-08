import { Module } from '@nestjs/common';
import { QualificationService } from './qualification.service.js';
import { QualificationController } from './qualification.controller.js';

@Module({
  controllers: [QualificationController],
  providers: [QualificationService],
  exports: [QualificationService],
})
export class QualificationModule {}
