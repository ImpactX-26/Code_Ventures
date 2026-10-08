import { Module } from '@nestjs/common';
import { ClarificationService } from './clarification.service.js';
import { ClarificationController } from './clarification.controller.js';

@Module({
  controllers: [ClarificationController],
  providers: [ClarificationService],
  exports: [ClarificationService],
})
export class ClarificationModule {}
