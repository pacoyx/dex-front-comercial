export function extractErrorMessage(err: unknown, fallback: string): string {
  const backendMessage = (err as { error?: { message?: unknown } })?.error?.message;
  if (typeof backendMessage === 'string' && backendMessage.trim() !== '') {
    return backendMessage;
  }

  const message = (err as Error)?.message;
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
