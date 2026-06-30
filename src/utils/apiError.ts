import axios from 'axios';

export function getFriendlyApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'La solicitud tardó demasiado. Revisa tu conexión e inténtalo otra vez.';
    }

    if (!error.response) {
      return 'No hay conexión con el servidor. Verifica internet o que el backend esté encendido.';
    }

    const status = error.response.status;

    if (status === 400) return extractServerMessage(error.response.data) ?? 'Hay datos inválidos. Revísalos e inténtalo nuevamente.';
    if (status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    if (status === 403) return 'No tienes permisos para realizar esta acción.';
    if (status === 404) return 'No encontramos la información solicitada.';
    if (status === 409) return extractServerMessage(error.response.data) ?? 'Ya existe un registro con esos datos.';
    if (status >= 500) return 'El servidor tuvo un problema. Inténtalo nuevamente en unos segundos.';
  }

  return 'Ocurrió un error inesperado. Inténtalo nuevamente.';
}

function extractServerMessage(data: unknown): string | null {
  if (!data) return null;

  if (typeof data === 'string') return data;

  if (typeof data === 'object') {
    const objectData = data as Record<string, unknown>;

    if (typeof objectData.message === 'string') return objectData.message;

    const firstFieldError = Object.values(objectData).find((value) => typeof value === 'string');
    if (typeof firstFieldError === 'string') return firstFieldError;
  }

  return null;
}
