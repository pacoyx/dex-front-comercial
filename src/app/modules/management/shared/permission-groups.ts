/**
 * Etiquetas en español para agrupar visualmente los permisos del sistema
 * (RBAC) en las pantallas de administración de Roles. Los codigos deben
 * coincidir EXACTAMENTE con los que envia/espera el backend.
 */
export const PERMISSION_MODULE_LABELS: Record<string, string> = {
  'dashboard.access': 'Dashboard General',
  'reception.access': 'Recepción (legado, ya ningún endpoint lo valida)',
  'reception.emision.access': 'Recepción - Emisión',
  'reception.retiro.access': 'Recepción - Retiro',
  'reception.consultas.access': 'Recepción - Consultas',
  'reception.caja.access': 'Recepción - Caja',
  'reception.gastos.access': 'Recepción - Gastos',
  'reception.maestros.access': 'Recepción - Maestros',
  'customers.access': 'Clientes',
  'invoices.access': 'Facturación',
  'purchases.access': 'Compras',
  'expenses.access': 'Gastos Empresariales',
  'employees.access': 'Recursos Humanos',
  'payroll.access': 'Planillas',
  'suppliers.access': 'Proveedores',
  'reports.access': 'Reportes Transversales',
  'settings.access': 'Configuración / Administración',
};

export function getPermissionModuleLabel(code: string): string {
  return PERMISSION_MODULE_LABELS[code] ?? code;
}
