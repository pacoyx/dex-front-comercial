import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToggleStoreServiceService } from '../../services/toggle-store-service.service';
import { PermissionsStoreService } from '../../services/permissions-store.service';

@Component({
  selector: 'app-layout-ventas',
  standalone: true,
  imports: [
    RouterModule, MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './layout-ventas.component.html',
  styleUrl: './layout-ventas.component.scss'
})
export class LayoutVentasComponent {

  loginService = inject(LoginService);
  private permissionsStore = inject(PermissionsStoreService);
  constructor(
    private router: Router,
    private toggleStore: ToggleStoreServiceService
  ) { }

  hasPermission(code: string): boolean {
    return this.permissionsStore.hasPermission(code);
  }

  cerrarSesion() {
    localStorage.setItem('dex24Auth', '');
    this.router.navigate(['/login']);
    this.toggleStore.setToggleState(false);
  }


  toggleSidenav() {
    this.toggleStore.setToggleState(true);
  }
}
