import { api } from './api';
import { User, UpdateUserRequest } from '../types/user';

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