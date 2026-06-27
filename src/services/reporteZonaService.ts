import { api } from './api';

export interface ReporteZonaRequest {
  latitude: number;
  longitude: number;
  descripcion?: string;
}

export interface ReporteZonaResponse {
  id: number;
  latitude: number;
  longitude: number;
  descripcion: string | null;
  username: string;
  fecha: string;
  procesado: boolean;
}

export async function createReporteZona(
  request: ReporteZonaRequest
): Promise<ReporteZonaResponse> {
  const response = await api.post<ReporteZonaResponse>('/reportes-zona', request);
  return response.data;
}

export async function getAllReportesZona(): Promise<ReporteZonaResponse[]> {
  const response = await api.get<ReporteZonaResponse[]>('/reportes-zona');
  return response.data;
}