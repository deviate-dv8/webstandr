export interface SerpResponse {
  id: string;
  requestId: string;
  success: string;
  provider: Prompt["provider"];
  query: string;
  promptId: string;
  createdAt: Date;
  updatedAt: Date;
}
