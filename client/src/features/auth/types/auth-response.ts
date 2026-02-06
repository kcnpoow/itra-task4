import type { User } from "@/entities/user";

export interface AuthResponse {
  accessToken: string;
  user: User;
}
