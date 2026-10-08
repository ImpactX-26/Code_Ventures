import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { WebResearchAgent } from '../ai/agents/web-research.agent.js';
import { Pathway } from '@prisma/client';

@Injectable()
export class WebResearchService {
  private readonly logger = new Logger(WebResearchService.name);
  private inMemResearch: Map<string, any> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly researchAgent: WebResearchAgent,
  ) {}

  async triggerResearch(applicantId: string, query?: string) {
    let pathway: Pathway = Pathway.STUDY;

    if (this.prisma.isConnected) {
      const applicant = await this.prisma.applicant.findUnique({ where: { id: applicantId } });
      if (applicant?.targetPathway) {
        pathway = applicant.targetPathway;
      }
    }

    const result = await this.researchAgent.conductResearch(pathway, query);

    if (this.prisma.isConnected) {
      const researchRecord = await this.prisma.webResearch.create({
        data: {
          pathway,
          query: result.query,
          summary: result.summary,
          rawResults: result.sources as any,
        },
      });

      for (const src of result.sources) {
        await this.prisma.researchSource.create({
          data: {
            webResearchId: researchRecord.id,
            applicantId,
            title: src.title,
            information: src.information,
            source: src.source,
            url: src.url,
            sourceType: src.sourceType,
            confidence: src.confidence,
            pathway: src.pathway,
            retrievedDate: src.retrievedDate,
          },
        });
      }
    } else {
      this.inMemResearch.set(applicantId, result);
    }

    return result;
  }

  async getResearchForApplicant(applicantId: string) {
    if (this.prisma.isConnected) {
      const sources = await this.prisma.researchSource.findMany({
        where: { applicantId },
        orderBy: { retrievedDate: 'desc' },
      });

      if (sources.length > 0) {
        return {
          applicantId,
          sources,
          notice: 'Information retrieved from external official German sources and may change according to statutory revisions.',
        };
      }
    }

    const inMem = this.inMemResearch.get(applicantId);
    if (inMem) {
      return {
        ...inMem,
        notice: 'Information retrieved from external official German sources and may change according to statutory revisions.',
      };
    }

    // Default research
    return this.triggerResearch(applicantId);
  }
}
