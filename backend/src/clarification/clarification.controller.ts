import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ClarificationService } from './clarification.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller()
export class ClarificationController {
  constructor(private readonly clarificationService: ClarificationService) {}

  @Get('applicants/:id/questions')
  async getQuestions(@Param('id') applicantId: string) {
    return this.clarificationService.getQuestions(applicantId);
  }

  @Post('questions/:id/answer')
  async answerQuestion(
    @Param('id') questionId: string,
    @Body() body: { selectedOption?: string; customAnswer?: string },
  ) {
    return this.clarificationService.answerQuestion(questionId, body);
  }
}
