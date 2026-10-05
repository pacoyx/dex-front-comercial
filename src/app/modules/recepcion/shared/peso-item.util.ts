/**
 * 'S' | 'N' — mismo campo "Es Peso?" que ya existe en el maestro de
 * servicios (mnt-prodservices / dialog-form-reg-prod-service).
 */
export function isPesoItem(isPeso?: string | null): boolean {
  return (isPeso || '').trim().toUpperCase() === 'S';
}
