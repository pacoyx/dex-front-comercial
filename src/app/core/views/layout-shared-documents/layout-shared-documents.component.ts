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
  selector: 'app-layout-shared-documents',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
  templateUrl: './layout-shared-documents.component.html',
  styleUrl: './layout-shared-documents.component.scss'
})
export class LayoutSharedDocumentsComponent {

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
