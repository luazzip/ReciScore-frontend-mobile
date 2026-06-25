import { api } from './api';

export interface RankingUser {
    userId: number;
    username: string;
    name: string;
    points: number;
    location: string;
    nivel: number;
    posicion: number;
}

export async function getRanking(): Promise<RankingUser[]> {
    const response = await api.get<RankingUser[]>('/ranking');
    return response.data;
}

export async function getRankingByDistrict(location: string): Promise<RankingUser[]> {
    const response = await api.get<RankingUser[]>(`/ranking/distrito/${location}`);
    return response.data;
}