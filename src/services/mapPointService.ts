import { api } from './api';

export interface MapPoint {
  id: number;
  latitude: number;
  longitude: number;
  nombre: string;
  tipo: string;
}

export interface MapPointRequest {
  latitude: number;
  longitude: number;
  nombre: string;
  tipo: string;
}

export async function getMapPoints(): Promise<MapPoint[]> {
  const response = await api.get<MapPoint[]>('/puntos-mapa');
  return response.data;
}

export async function getMapPointById(id: number): Promise<MapPoint> {
  const response = await api.get<MapPoint>(`/puntos-mapa/${id}`);
  return response.data;
}

export async function createMapPoint(request: MapPointRequest): Promise<MapPoint> {
  const response = await api.post<MapPoint>('/puntos-mapa', request);
  return response.data;
}

export async function deleteMapPoint(id: number): Promise<void> {
  await api.delete(`/puntos-mapa/${id}`);
}