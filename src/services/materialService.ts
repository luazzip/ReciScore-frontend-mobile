import { api } from './api';

export interface Material {
    id: number;
    name: string;
    pointsPerKg: number;
    weight: number;
    category: string;
    recyclable: boolean;
}

export interface MaterialRequest {
    name: string;
    pointsPerKg: number;
    weight: number;
    category: string;
    recyclable: boolean;
}

export async function getMaterials(): Promise<Material[]> {
    const response = await api.get<Material[]>('/material');
    return response.data;
}

export async function getMaterialById(id: number): Promise<Material> {
    const response = await api.get<Material>(`/material/${id}`);
    return response.data;
}

export async function getMaterialsByCategory(category: string): Promise<Material[]> {
    const response = await api.get<Material[]>(`/material/category/${category}`);
    return response.data;
}

export async function createMaterial(request: MaterialRequest): Promise<Material> {
    const response = await api.post<Material>('/material', request);
    return response.data;
}