import { api } from './api';
import { RecyclingRequest, RecyclingReport } from '../types/recycling';

export async function createRecyclingReport(
    request: RecyclingRequest
): Promise<RecyclingReport> {
    const response = await api.post<RecyclingReport>('/reportes-reciclaje', request);
    return response.data;
}

export async function getAllRecyclingReports(): Promise<RecyclingReport[]> {
    const response = await api.get<RecyclingReport[]>('/reportes-reciclaje');
    return response.data;
}

export async function getRecyclingHistoryByUser(userId: number): Promise<RecyclingReport[]> {
    const response = await api.get<RecyclingReport[]>(`/reportes-reciclaje/historial/${userId}`);
    return response.data;
}

export async function getRecyclingReportById(id: number): Promise<RecyclingReport> {
    const response = await api.get<RecyclingReport>(`/reportes-reciclaje/${id}`);
    return response.data;
}

export async function deleteRecyclingReport(id: number): Promise<void> {
    await api.delete(`/reportes-reciclaje/${id}`);
}