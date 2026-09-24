export function extractErrorMessage(err: unknown, fallback: string): string {
  const httpError = err as { error?: unknown; message?: string };
  const body = httpError?.error;

  if (typeof body === 'string' && body.trim() !== '') {
    return body;
  }

  if (body && typeof body === 'object' && typeof (body as { message?: unknown }).message === 'string') {
    const message = (body as { message: string }).message;
    if (message.trim() !== '') {
      return message;
    }
  }

  const message = httpError?.message;
  if (typeof message === 'string' && message.trim() !== '' && message !== '[object Object]') {
    return message;
  }

  return fallback;
}

/**
 * Extrae la lista de errores de validación de una respuesta 400 BadRequest.
 * Soporta tanto un array de strings crudo como un objeto { errors: string[] }.
 */
export function extractValidationErrors(err: unknown): string[] {
  const httpError = err as { status?: number; error?: unknown };
  if (httpError?.status !== 400) {
    return [];
  }

  const body = httpError.error;
  if (Array.isArray(body)) {
    return body.filter((item): item is string => typeof item === 'string');
  }
  if (body && typeof body === 'object' && Array.isArray((body as { errors?: unknown }).errors)) {
    return (body as { errors: unknown[] }).errors.filter((item): item is string => typeof item === 'string');
  }
  return [];
}
