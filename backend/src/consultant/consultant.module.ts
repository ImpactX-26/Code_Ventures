import { Module } from '@nestjs/common';
import { ConsultantService } from './consultant.service.js';
import { ConsultantController } from './consultant.controller.js';

@Module({
  controllers: [ConsultantController],
  providers: [ConsultantService],
  exports: [ConsultantService],
})
export class ConsultantModule {}
