import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../../core/services/notifications-system.service';
import { DialogQuestionComponent } from '../../../../../../recepcion/components/dialog-question/dialog-question.component';
import { CustomerPortalService } from '../../../../../services/customer-portal.service';
import { IPortalStatus } from '../../../../../interfaces/IPortal';
import { extractErrorMessage } from '../../../../../shared/http-error.util';
import { DialogHabilitarPortalComponent } from './components/dialog-habilitar-portal/dialog-habilitar-portal.component';
import { DialogActivationLinkComponent } from './components/dialog-activation-link/dialog-activation-link.component';
import { DialogResetPasswordUsuarioComponent } from './components/dialog-reset-password-usuario/dialog-reset-password-usuario.component';

@Component({
  selector: 'app-portal-cliente-tab',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, DatePipe, LoadingComponent],
  templateUrl: './portal-cliente-tab.component.html',
  styleUrl: './portal-cliente-tab.component.css'
})
export class PortalClienteTabComponent implements OnInit, OnChanges {

  @Input({ required: true }) customerId!: number;

  private customerPortalService = inject(CustomerPortalService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  estado: IPortalStatus | null = null;
  loading = false;

  ngOnInit(): void {
    this.cargarEstado();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerId'] && !changes['customerId'].firstChange) {
      this.cargarEstado();
    }
  }

  cargarEstado(): void {
    if (!this.customerId) return;
    this.loading = true;
    this.customerPortalService.obtenerEstado(this.customerId).subscribe({
      next: (resp) => {
        this.estado = resp.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo obtener el estado del Portal Cliente.'));
      },
    });
  }

  habilitarPortal(): void {
    const dialogRef = this.dialog.open(DialogHabilitarPortalComponent, {
      width: '480px',
      data: { customerId: this.customerId },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarEstado();
        this.dialog.open(DialogActivationLinkComponent, {
          width: '480px',
          data: { title: 'Portal Habilitado', activationUrl: result.activationUrl },
        });
      }
    });
  }

  regenerarLink(): void {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: {
        title: 'Regenerar Link de Activación',
        message: '¿Está seguro de regenerar el link de activación? El link anterior dejará de ser válido.',
        msgButton: 'Regenerar',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'OK') {
        this.customerPortalService.regenerarLink(this.customerId).subscribe({
          next: (resp) => {
            this.dialog.open(DialogActivationLinkComponent, {
              width: '480px',
              data: { title: 'Nuevo Link de Activación', activationUrl: resp.data.activationUrl },
            });
          },
          error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudo regenerar el link de activación.')),
        });
      }
    });
  }

  resetearPasswordUsuario(): void {
    const dialogRef = this.dialog.open(DialogResetPasswordUsuarioComponent, {
      width: '480px',
      data: { customerId: this.customerId },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarEstado();
      }
    });
  }

}
