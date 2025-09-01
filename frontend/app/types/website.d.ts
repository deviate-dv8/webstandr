export interface Website {
  id: string;
  name: string;
  description: string;
  type: "personal" | "competitor";
  url: string;
  userId: number;
  icon: string;
  prompts?: Prompt[];
  websiteInsights?: WebsiteInsight[];
  createdAt: Date;
  updatedAt: Date;
}
