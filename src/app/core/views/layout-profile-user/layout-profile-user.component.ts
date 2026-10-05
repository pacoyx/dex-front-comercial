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

@Component({
  selector: 'app-layout-profile-user',
  standalone: true,
  imports: [
    RouterModule, MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './layout-profile-user.component.html',
  styleUrl: './layout-profile-user.component.scss'
})
export class LayoutProfileUserComponent {

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
