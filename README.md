# dex-front-comercial

Frontend en Angular para el sistema comercial de la lavandería (Dexter). Cubre recepción de prendas, roperío, compras, facturación, RRHH, gastos, operaciones corporativas y administración, todo con control de acceso basado en permisos (RBAC).

## Stack técnico

- **Angular 18** (standalone components + módulos con lazy loading)
- **Angular Material** y **Angular CDK**
- **@ngrx/signals** para estado local
- **ApexCharts** (`ng-apexcharts`) para dashboards y reportes
- **RxJS**
- Autenticación por JWT con refresh token (interceptor HTTP + guard de permisos)

## Requisitos

- Node.js y npm
- Angular CLI 18 (`npm install -g @angular/cli` opcional, el proyecto ya trae `@angular/cli` como devDependency)

## Puesta en marcha

```bash
npm install
npm start        # ng serve, http://localhost:4200
```

Otros scripts disponibles (`package.json`):

- `npm run build` — build de producción
- `npm run watch` — build de desarrollo en modo watch
- `npm test` — pruebas unitarias (Karma/Jasmine)

## Configuración de entornos

Los archivos `src/environments/environment*.ts` definen `apiUrlBase` (y `apiUrlBaseAzure`) junto con el listado de endpoints (`EP...`) consumidos por los servicios Angular. Al agregar un nuevo endpoint hay que mantener sincronizados `environment.ts`, `environment.development.ts` y `environment.production.ts`.

## Estructura del proyecto

```
src/app/
├── core/               # layouts por módulo, guards, interceptors, login, componentes compartidos
└── modules/
    ├── recepcion/          # recepción de prendas, caja, touch, emisión, consultas, reportes
    ├── roperia/            # guías de recojo, tickets, consultas, dashboard de ropería
    ├── purchase/           # compras: maestros, operaciones, cuentas por pagar, reportes
    ├── facturacion/        # clientes, facturas, cuentas por cobrar, tarifas por cliente,
    │                       # portal de clientes, planillas, dashboard y reportes
    ├── rrhh/               # trabajadores, asistencia, planillas, préstamos, catálogos
    ├── gastos/             # registro de gastos, categorías, dashboard y reportes
    ├── corporate-operations/ # guías de recojo corporativas y gestión de vehículos
    ├── management/         # usuarios, roles, empresa y configuraciones del sistema
    └── profile-user/       # perfil del usuario autenticado
```

Cada módulo sigue la misma convención interna: `interfaces/`, `services/`, `shared/` (utilidades propias del módulo, p. ej. manejo de errores HTTP) y `views/` (componentes de pantalla, standalone o con módulo propio).

## Routing y control de acceso

Las rutas principales (`src/app/app.routes.ts`) están protegidas con `permissionGuard`, que valida un permiso específico por módulo contra los permisos del usuario autenticado:

| Ruta | Permiso requerido |
|---|---|
| `management` | `settings.access` |
| `recepcion` | `reception.access` |
| `roperia` | `reception.access` (sin permiso propio aún en backend) |
| `purchase` | `purchases.access` |
| `facturacion` | `invoices.access` |
| `rrhh` | `employees.access` |
| `gastos` | `expenses.access` |
| `corporate-operations` | `corporate-operations.access` |

`profileUser` solo requiere estar autenticado (sin permiso adicional). Cada módulo con rutas protegidas se carga de forma perezosa (`loadChildren`) dentro de su propio layout (`core/views/layout-*`).

## Backend

El backend relacionado vive en un repositorio aparte (`24dex-backend-comercial`). Los contratos de interfaces y servicios de este frontend deben verificarse contra ese backend antes de modificarse, ya que los endpoints y payloads se definen ahí.
