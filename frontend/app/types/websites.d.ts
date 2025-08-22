export interface Website {
  id: string;
  name: string;
  type: "personal" | "competitor";
  url: string;
  userId: number;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}
