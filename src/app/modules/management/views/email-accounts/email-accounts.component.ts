import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { DialogQuestionComponent } from '../../../recepcion/components/dialog-question/dialog-question.component';
import { EmailAccountsService } from '../../services/email-accounts.service';
import { EMAIL_ACCOUNT_OPERATIONS, IEmailAccount } from '../../interfaces/IEmailAccount';
import { DialogEmailAccountComponent } from './components/dialog-email-account/dialog-email-account.component';

@Component({
  selector: 'app-email-accounts',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatTableModule, MatTooltipModule, LoadingComponent, DatePipe],
  templateUrl: './email-accounts.component.html',
  styleUrl: './email-accounts.component.css'
})
export class EmailAccountsComponent implements OnInit {

  private emailAccountsService = inject(EmailAccountsService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  cuentas: IEmailAccount[] = [];
  loading = false;

  displayedColumns: string[] = ['operacion', 'host', 'userName', 'isActive', 'hasPassword', 'operaciones'];

  ngOnInit(): void {
    this.cargarCuentas();
  }

  cargarCuentas(): void {
    this.loading = true;
    this.emailAccountsService.listarCuentas().subscribe({
      next: (resp) => {
        this.cuentas = resp.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(err?.message || 'No se pudieron cargar las cuentas de correo.');
      },
    });
  }

  getOperacionLabel(operacion: string): string {
    return EMAIL_ACCOUNT_OPERATIONS.find(o => o.value === operacion)?.label || operacion;
  }

  nuevaCuenta(): void {
    const dialogRef = this.dialog.open(DialogEmailAccountComponent, {
      data: { esNuevo: true, objCuenta: null },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarCuentas();
      }
    });
  }

  editarCuenta(cuenta: IEmailAccount): void {
    const dialogRef = this.dialog.open(DialogEmailAccountComponent, {
      data: { esNuevo: false, objCuenta: cuenta },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarCuentas();
      }
    });
  }

  eliminarCuenta(cuenta: IEmailAccount): void {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Cuenta de Correo',
        message: `¿Está seguro de eliminar la cuenta "${cuenta.userName}" (${this.getOperacionLabel(cuenta.operacion)})?`,
        msgButton: 'Eliminar',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'OK') {
        this.emailAccountsService.eliminarCuenta(cuenta.id).subscribe({
          next: (resp) => {
            if (resp.success) {
              this.notificationService.showSuccess('Cuenta de correo eliminada.');
              this.cargarCuentas();
            }
          },
          error: (err) => {
            this.notificationService.showError(err?.message || 'No se pudo eliminar la cuenta de correo.');
          },
        });
      }
    });
  }

}
