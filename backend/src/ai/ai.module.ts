import { Module, Global } from '@nestjs/common';
import { AiProviderService } from './providers/ai-provider.service.js';
import { IntakeAgent } from './agents/intake.agent.js';
import { ProfileAgent } from './agents/profile.agent.js';
import { DocumentAgent } from './agents/document.agent.js';
import { WebResearchAgent } from './agents/web-research.agent.js';
import { VerificationAgent } from './agents/verification.agent.js';
import { ClarificationAgent } from './agents/clarification.agent.js';
import { QualificationAgent } from './agents/qualification.agent.js';
import { RecommendationAgent } from './agents/recommendation.agent.js';
import { CvAgent } from './agents/cv.agent.js';
import { VideoAgent } from './agents/video.agent.js';
import { ApplicantOrchestratorService } from './orchestrator/applicant-orchestrator.service.js';

@Global()
@Module({
  providers: [
    AiProviderService,
    IntakeAgent,
    ProfileAgent,
    DocumentAgent,
    WebResearchAgent,
    VerificationAgent,
    ClarificationAgent,
    QualificationAgent,
    RecommendationAgent,
    CvAgent,
    VideoAgent,
    ApplicantOrchestratorService,
  ],
  exports: [
    AiProviderService,
    IntakeAgent,
    ProfileAgent,
    DocumentAgent,
    WebResearchAgent,
    VerificationAgent,
    ClarificationAgent,
    QualificationAgent,
    RecommendationAgent,
    CvAgent,
    VideoAgent,
    ApplicantOrchestratorService,
  ],
})
export class AiModule {}
