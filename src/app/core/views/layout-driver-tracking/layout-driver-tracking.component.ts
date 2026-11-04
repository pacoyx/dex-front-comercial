import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToggleStoreServiceService } from '../../services/toggle-store-service.service';

@Component({
  selector: 'app-layout-driver-tracking',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
  templateUrl: './layout-driver-tracking.component.html',
  styleUrl: './layout-driver-tracking.component.scss'
})
export class LayoutDriverTrackingComponent {

  loginService = inject(LoginService);

  constructor(
    private router: Router,
    private toggleStore: ToggleStoreServiceService
  ) { }

  cerrarSesion() {
    localStorage.setItem('dex24Auth', '');
    this.router.navigate(['/login']);
    this.toggleStore.setToggleState(false);
  }

  toggleSidenav() {
    this.toggleStore.setToggleState(true);
  }
}
