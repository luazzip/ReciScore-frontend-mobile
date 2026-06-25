import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './tokenService';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          await clearTokens();
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );

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