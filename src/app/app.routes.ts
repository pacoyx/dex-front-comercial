import { Routes } from '@angular/router';
import { LoginComponent } from './core/components/login/login.component';
import { UnauthorizedComponent } from './core/components/unauthorized/unauthorized.component';
import { LayoutPlataformaComponent } from './core/views/layout-plataforma/layout-plataforma.component';
import { LayoutManagementComponent } from './core/views/layout-management/layout-management.component';
import { LayoutProfileUserComponent } from './core/views/layout-profile-user/layout-profile-user.component';
import { LayoutRoperiaComponent } from './core/views/layout-roperia/layout-roperia.component';
import { LayoutPurchaseComponent } from './core/views/layout-purchase/layout-purchase.component';
import { LayoutFacturacionComponent } from './core/views/layout-facturacion/layout-facturacion.component';
import { LayoutRrhhComponent } from './core/views/layout-rrhh/layout-rrhh.component';
import { LayoutGastosComponent } from './core/views/layout-gastos/layout-gastos.component';
import { LayoutCorporateOperationsComponent } from './core/views/layout-corporate-operations/layout-corporate-operations.component';
import { permissionGuard } from './core/guards/permission.guard';
import { RECEPTION_PERMISSIONS } from './core/constants/reception-permissions';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'unauthorized', component: UnauthorizedComponent },
    // { path: 'profileUser', component: ProfileUserComponent },
    // { path: 'Users', component: ManagentUsersComponent },
    {
        // Perfil propio: no requiere ningun permiso especifico, solo estar autenticado.
        path: 'profileUser', component: LayoutProfileUserComponent, children: [
            { path: '', loadChildren: () => import('./modules/profile-user/profile-user.module').then(m => m.ProfileUserModule) }
        ]
    },
    {
        path: 'management', component: LayoutManagementComponent, canActivate: [permissionGuard], data: { permission: 'settings.access' }, children: [
            { path: '', loadChildren: () => import('./modules/management/management.module').then(m => m.ManagementModule) }
        ]
    },
    {
        // Entrar al shell de Recepcion requiere al menos uno de los 6 permisos
        // granulares de submenu; cada submenu valida ademas el suyo propio
        // en recepcion-routing.module.ts.
        path: 'recepcion', component: LayoutPlataformaComponent, canActivate: [permissionGuard], data: { permission: [...RECEPTION_PERMISSIONS] }, children: [
            { path: '', loadChildren: () => import('./modules/recepcion/recepcion.module').then(m => m.RecepcionModule) }
        ]
    },
    {
        // Roperia no tiene un permiso propio en el backend (los 11 permisos no lo cubren).
        // Se protege con reception.access como aproximacion hasta que el backend defina uno.
        path: 'roperia', component: LayoutRoperiaComponent, canActivate: [permissionGuard], data: { permission: 'reception.access' }, children: [
            { path: '', loadChildren: () => import('./modules/roperia/roperia.module').then(m => m.RoperiaModule) }
        ]
    },
    {
        path: 'purchase', component: LayoutPurchaseComponent, canActivate: [permissionGuard], data: { permission: 'purchases.access' }, children: [
            { path: '', loadChildren: () => import('./modules/purchase/purchase.module').then(m => m.PurchaseModule) }
        ]
    },
    {
        path: 'facturacion', component: LayoutFacturacionComponent, canActivate: [permissionGuard], data: { permission: 'invoices.access' }, children: [
            { path: '', loadChildren: () => import('./modules/facturacion/facturacion.module').then(m => m.FacturacionModule) }
        ]
    },
    {
        path: 'rrhh', component: LayoutRrhhComponent, canActivate: [permissionGuard], data: { permission: 'employees.access' }, children: [
            { path: '', loadChildren: () => import('./modules/rrhh/rrhh.module').then(m => m.RrhhModule) }
        ]
    },
    {
        path: 'gastos', component: LayoutGastosComponent, canActivate: [permissionGuard], data: { permission: 'expenses.access' }, children: [
            { path: '', loadChildren: () => import('./modules/gastos/gastos.module').then(m => m.GastosModule) }
        ]
    },
    {
        path: 'corporate-operations', component: LayoutCorporateOperationsComponent, canActivate: [permissionGuard], data: { permission: 'corporate-operations.access' }, children: [
            { path: '', loadChildren: () => import('./modules/corporate-operations/corporate-operations.module').then(m => m.CorporateOperationsModule) }
        ]
    }
];
