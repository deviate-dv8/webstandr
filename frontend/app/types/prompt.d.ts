interface Prompt {
  id: string;
  name: string;
  query: string;
  websiteId: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  provider: "google" | "bing" | "yahoo" | "duckduckgo";
  schedule: "daily" | "weekly" | "monthly" | "annually";
}
