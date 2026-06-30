import { api } from './api';
import { User, UpdateUserRequest, UserImpact } from '../types/user';

export async function getCurrentUserProfile(): Promise<User> {
  const response = await api.get<User>('/users/me');
  return response.data;
}

export async function getCurrentUserImpact(): Promise<UserImpact> {
  const response = await api.get<UserImpact>('/users/me/impacto');
  return response.data;
}

export async function getUserById(id: number): Promise<User> {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
}

export async function updateUser(id: number, request: UpdateUserRequest): Promise<User> {
  const response = await api.patch<User>(`/users/${id}`, request);
  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}
