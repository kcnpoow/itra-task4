import { authApi } from "@/features/auth";
import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry: boolean;
    };

    const status = error.response?.status;
    const isRetry = originalRequest?._retry;

    if (status !== 401 || isRetry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { accessToken } = await authApi.refresh();

      localStorage.setItem("accessToken", accessToken);

      return api(originalRequest);
    } catch {
      useAuthStore.getState().logout();

      return Promise.reject(error);
    }
  },
);

export { api };
