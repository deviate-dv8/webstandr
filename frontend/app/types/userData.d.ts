interface UserData {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  emailVerifiedAt: Data | null;
  passwordResetAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
