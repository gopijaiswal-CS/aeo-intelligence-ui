export interface Product {
  id: number;
  name: string;
  category: string;
  visibility: number;
  seoHealth: number;
  brokenLinks: number;
  mentions: number;
  citations: number;
  trend: number[];
}

export interface Competitor {
  id: number;
  name: string;
  visibility: number;
  mentions: number;
  citations: number;
  rank: number;
  category: string;
}

export interface CitationSource {
  url: string;
  llm: string;
  weight: number;
  mentions: number;
}

export interface AIVisibility {
  overallScore: number;
  citationSources: CitationSource[];
  topMentions: number;
  brokenLinksTotal: number;
  avgCitationWeight: number;
  weeklyTrend: number[];
}
