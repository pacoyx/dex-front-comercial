import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToggleStoreServiceService } from '../../services/toggle-store-service.service';
import { PermissionsStoreService } from '../../services/permissions-store.service';

@Component({
  selector: 'app-layout-facturacion',
  standalone: true,
  imports: [
    RouterModule, MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, MatMenuModule, MatDividerModule
  ],
  templateUrl: './layout-facturacion.component.html',
  styleUrl: './layout-facturacion.component.scss'
})
export class LayoutFacturacionComponent {

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
