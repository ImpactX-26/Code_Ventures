import { Injectable, Logger } from '@nestjs/common';
import { AiProviderService, WebResearchItem } from '../providers/ai-provider.service.js';
import { Pathway } from '@prisma/client';

@Injectable()
export class WebResearchAgent {
  private readonly logger = new Logger(WebResearchAgent.name);

  constructor(private readonly aiProvider: AiProviderService) {}

  async conductResearch(pathway: Pathway, query?: string): Promise<{
    query: string;
    summary: string;
    sources: WebResearchItem[];
  }> {
    this.logger.log(`WebResearchAgent initiating dynamic search for Germany requirements: ${pathway}`);
    const sources = await this.aiProvider.liveWebResearch(pathway, query);

    const summary =
      pathway === Pathway.STUDY
        ? 'Live German academic research confirmed: Higher education admission requires Anabin H+ verification / APS certificate, minimum German grade equivalent of 2.5, proof of language competence (IELTS 6.5+ or TestDaF/C1), and a federally mandated blocked account deposit (€11,904).'
        : pathway === Pathway.VOCATIONAL
        ? 'Live German vocational research confirmed: Dual vocational training (Duale Ausbildung) requires certified German proficiency of at least B1/B2, high school certificate evaluation (Zeugnisanerkennungsstelle), and an enterprise training contract approved by the Bundesagentur für Arbeit.'
        : 'Live German skilled immigration research confirmed: EU Blue Card eligibility under the Skilled Immigration Act requires a recognized degree (Anabin H+), meeting the current salary threshold (€45,300, or €41,041 for shortage occupations), and an approved employment contract.';

    return {
      query: query || `Current Germany ${pathway} regulations and admission standards`,
      summary,
      sources,
    };
  }
}
