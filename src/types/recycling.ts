export interface RecyclingRequest {
    userId: number;
    materialId: number;
    fotoUrl: string;
    tamanoObjeto: 'PEQUENO' | 'MEDIANO' | 'GRANDE';
    numeroArticulos: number;
    latitud: number;
    longitud: number;
}

export interface RecyclingReport {
    numeroReporte: number;
    userId: number;
    userName: string;
    materialNombre: string;
    materialCategoria: string;
    fotoUrl: string;
    tamanoObjeto: string;
    numeroArticulos: number;
    materialDetectadoIa: boolean;
    confianzaIa: number;
    validadoIa: boolean;
    gpsValidado: boolean;
    fecha: string;
}