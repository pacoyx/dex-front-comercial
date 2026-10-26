/**
 * Mensaje EXACTO que devuelve el backend (login, refresh-token y
 * AccessScheduleMiddleware) cuando un usuario esta fuera de su horario de
 * acceso configurado. Es la unica forma de diferenciar este 403 de un 403
 * por falta de permisos (RBAC), ya que ambos comparten el mismo status code.
 */
export const ACCESS_SCHEDULE_BLOCKED_MESSAGE = 'Fuera de su horario de acceso permitido.';
