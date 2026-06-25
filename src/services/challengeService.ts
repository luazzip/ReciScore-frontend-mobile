import { api } from './api';

export interface Challenge {
    id: number;
    titulo: string;
    descripcion?: string;
    categoria: string;
    meta_valor?: number;
    puntos: number;
    fecha_inicio: string;
    fecha_fin: string;
    activo: boolean;
}

export interface CreateChallengeRequest {
    titulo: string;
    descripcion: string;
    categoria: string;
    meta_valor: number;
    puntos: number;
    fecha_inicio: string;
    fecha_fin: string;
}

export interface UpdateChallengeRequest {
    titulo: string;
    descripcion: string;
    categoria: string;
    activo: boolean;
}

export async function getChallenges(): Promise<Challenge[]> {
    const response = await api.get<Challenge[]>('/desafios');
    return response.data;
}

export async function getChallengeById(id: number): Promise<Challenge> {
    const response = await api.get<Challenge>(`/desafios/${id}`);
    return response.data;
}

export async function joinChallenge(challengeId: number, userId: number): Promise<Challenge> {
    const response = await api.post<Challenge>(
        `/desafios/${challengeId}/unirse`,
        null,
        { params: { userId } }
    );

    return response.data;
}

export async function createChallenge(request: CreateChallengeRequest): Promise<Challenge> {
    const response = await api.post<Challenge>('/desafios', request);
    return response.data;
}

export async function updateChallenge(
    id: number,
    request: UpdateChallengeRequest
): Promise<Challenge> {
    const response = await api.patch<Challenge>(`/desafios/${id}`, request);
    return response.data;
}