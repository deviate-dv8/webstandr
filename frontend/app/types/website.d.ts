export interface Website {
  id: string;
  name: string;
  description: string;
  type: "personal" | "competitor";
  url: string;
  userId: number;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}
