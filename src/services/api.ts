import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './tokenService';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn('EXPO_PUBLIC_API_URL no está configurado. La app no podrá conectarse al backend.');
}

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean; _networkRetry?: boolean };

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    const isRecoverable = !error.response || (error.response.status >= 500 && error.response.status < 600);

    if (isRecoverable && originalRequest && !originalRequest._networkRetry) {
      originalRequest._networkRetry = true;
      await new Promise((resolve) => setTimeout(resolve, 700));
      return api(originalRequest);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          await clearTokens();
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
        });

        const { token, refreshToken: newRefreshToken } = response.data;
        await saveTokens(token, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        await clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
