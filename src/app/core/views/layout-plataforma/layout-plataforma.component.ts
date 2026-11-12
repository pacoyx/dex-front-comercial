import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSidenav } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoginService } from '../../services/login.service';
import { ToggleStoreServiceService } from '../../services/toggle-store-service.service';
import { PermissionsStoreService } from '../../services/permissions-store.service';
import { DialogAdjuntarFotoGuiaComponent } from '../../../modules/recepcion/components/dialog-adjuntar-foto-guia/dialog-adjuntar-foto-guia.component';

@Component({
  selector: 'app-layout-plataforma',
  standalone: true,
  imports: [
    RouterOutlet, MatToolbarModule, MatIconModule,
    MatButtonModule, RouterModule, MatSidenavModule,
    MatListModule, MatMenuModule, MatDividerModule, MatTooltipModule
  ],
  templateUrl: './layout-plataforma.component.html',
  styleUrl: './layout-plataforma.component.scss'
})
export class LayoutPlataformaComponent {

  loginService = inject(LoginService);
  private permissionsStore = inject(PermissionsStoreService);
  private dialog = inject(MatDialog);

  @ViewChild('inputCamaraFab') inputCamaraFab!: ElementRef<HTMLInputElement>;

  constructor(
    private toggleStore: ToggleStoreServiceService
  ) { }

  hasPermission(code: string): boolean {
    return this.permissionsStore.hasPermission(code);
  }

  cerrarSesion() {
    this.loginService.logout();
    this.toggleStore.setToggleState(false);
  }


  toggleSidenav() {
    this.toggleStore.setToggleState(true);
  }

  abrirAdjuntarFoto(): void {
    this.inputCamaraFab.nativeElement.click();
  }

  onFotoCapturada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivos = input.files;
    if (!archivos || archivos.length === 0) {
      return;
    }

    const archivosIniciales = Array.from(archivos);
    input.value = '';

    this.dialog.open(DialogAdjuntarFotoGuiaComponent, {
      width: '480px',
      disableClose: true,
      data: { archivosIniciales }
    });
  }

}
