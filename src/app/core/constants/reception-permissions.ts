/**
 * Codigos de permiso granulares del modulo Recepcion (uno por submenu).
 * Reemplazan al permiso legado 'reception.access', que ya no es validado
 * por ningun endpoint del backend pero se mantiene en la base de datos.
 */
export const RECEPTION_PERMISSIONS = [
  'reception.emision.access',
  'reception.retiro.access',
  'reception.consultas.access',
  'reception.caja.access',
  'reception.gastos.access',
  'reception.maestros.access',
] as const;
