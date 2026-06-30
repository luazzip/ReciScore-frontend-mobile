export interface RecyclingRequest {
    materialId: number;
    fotoUrl: string;
    tamanoObjeto: 'PEQUENO' | 'MEDIANO' | 'GRANDE';
    numeroArticulos: number;
    latitud: number;
    longitud: number;
}

export interface RecyclingReport {
    numeroReporte: number;
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