export interface Website {
  id: string;
  name: string;
  description: string;
  type: "personal" | "competitor";
  url: string;
  userId: number;
  icon: string;
  prompts?: Prompt[];
  createdAt: Date;
  updatedAt: Date;
}
