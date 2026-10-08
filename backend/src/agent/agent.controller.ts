import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { AgentService } from './agent.service.js';

@Controller('api/agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('chat')
  async chat(
    @Body()
    body: {
      applicantId: string;
      message: string;
      sessionId?: string;
    },
  ) {
    return this.agentService.handleUserMessage(
      body.applicantId,
      body.message,
      body.sessionId,
    );
  }

  @Get('history/:sessionId')
  async getHistory(@Param('sessionId') sessionId: string) {
    return this.agentService.getChatHistory(sessionId);
  }
}
