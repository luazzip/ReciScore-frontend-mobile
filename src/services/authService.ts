import { api } from './api';
import { saveTokens, clearTokens } from './tokenService';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

export async function login(request: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', request);
    await saveTokens(response.data.token, response.data.refreshToken);
    return response.data;
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', request);
    await saveTokens(response.data.token, response.data.refreshToken);
    return response.data;
}

export async function logout() {
    await clearTokens();
}