import { create } from "zustand";

import type { AuthResponse } from "@/features/auth/types";
import type { User } from "@/entities/user";

interface State {
  user: User | null;
  isAuthenticated: boolean;
}

interface Actions {
  login: (data: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<State & Actions>()((set) => ({
  user: null,
  isAuthenticated: false,
  login: (data) => {
    if (data.accessToken && data.user) {
      localStorage.setItem("accessToken", data.accessToken);

      set({ user: data.user, isAuthenticated: true });
    }
  },
  logout: () => {
    localStorage.removeItem("accessToken");

    set({ user: null, isAuthenticated: false });
  },
}));
