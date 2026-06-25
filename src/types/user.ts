export interface User {
    id: number;
    email: string;
    name: string;
    username: string;
    points: number;
    multiplier: number;
    profilePicture?: string;
    location?: string;
    reciclajes: number;
    nivel: number;
    rachaDias: number;
    fechaRegistro: string;
}

export interface UpdateUserRequest {
    name?: string;
    username?: string;
    profilePicture?: string;
    location?: string;
}