/**
 * 'S' | 'N' — mismo campo "Es Lavado?" que ya existe en el maestro de
 * servicios (mnt-prodservices / dialog-form-reg-prod-service).
 */
export function isLavadoItem(isLavado?: string | null): boolean {
  return (isLavado || '').trim().toUpperCase() === 'S';
}
