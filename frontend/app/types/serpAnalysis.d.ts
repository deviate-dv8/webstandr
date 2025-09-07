interface SerpAnalysis {
  id: string;
  serpResponseId: string;
  highestRank: number | null;
  averageRank: number | null;
  frequency: number;
  createdAt: Date;
  updatedAt: Date;
}
