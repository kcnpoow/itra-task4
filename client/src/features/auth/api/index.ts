import axios from "axios";

import type { AuthResponse, LoginDto, RegisterDto } from "../types";
import { api } from "@/shared/api";

class AuthApi {
  private readonly SERVER_URL = import.meta.env.VITE_SERVER_URL;

  login = async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post("/auth/signin", data);

    return response.data;
  };

  register = async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post("/auth/signup", data);

    return response.data;
  };

  auth = async (): Promise<AuthResponse> => {
    const response = await api.get("/auth");

    return response.data;
  };

  logout = async () => {
    await api.post("/auth/logout");
  };

  refresh = async (): Promise<Omit<AuthResponse, "user">> => {
    const response = await axios.get(`${this.SERVER_URL}/auth/refresh`, {
      withCredentials: true,
    });

    return response.data;
  };

  verifyEmail = async (verificationToken: string) => {
    await axios.patch(
      `${this.SERVER_URL}/auth/verify-email?token=${verificationToken}`,
    );
  };
}

export const authApi = new AuthApi();
