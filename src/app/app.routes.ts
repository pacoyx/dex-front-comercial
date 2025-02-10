import { Routes } from '@angular/router';
import { LoginComponent } from './core/components/login/login.component';
import { LayoutPlataformaComponent } from './core/views/layout-plataforma/layout-plataforma.component';
import { LayoutManagementComponent } from './core/views/layout-management/layout-management.component';
import { LayoutProfileUserComponent } from './core/views/layout-profile-user/layout-profile-user.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    // { path: 'profileUser', component: ProfileUserComponent },
    // { path: 'Users', component: ManagentUsersComponent },
    {
        path: 'profileUser', component: LayoutProfileUserComponent, children: [
            { path: '', loadChildren: () => import('./modules/profile-user/profile-user.module').then(m => m.ProfileUserModule) }
        ]
    },
    {
        path: 'management', component: LayoutManagementComponent, children: [
            { path: '', loadChildren: () => import('./modules/management/management.module').then(m => m.ManagementModule) }
        ]
    },
    {
        path: 'recepcion', component: LayoutPlataformaComponent, children: [
            { path: '', loadChildren: () => import('./modules/recepcion/recepcion.module').then(m => m.RecepcionModule) }
        ]
    }
];
