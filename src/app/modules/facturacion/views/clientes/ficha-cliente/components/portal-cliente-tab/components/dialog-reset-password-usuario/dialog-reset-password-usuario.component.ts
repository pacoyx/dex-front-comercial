import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingComponent } from '../../../../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../../../../core/services/notifications-system.service';
import { CustomerPortalService } from '../../../../../../../services/customer-portal.service';
import { ICustomerUserAdmin, IResetCustomerUserPasswordResponse } from '../../../../../../../interfaces/IPortal';
import { extractErrorMessage } from '../../../../../../../shared/http-error.util';

export interface IDialogResetPasswordUsuarioData {
  customerId: number;
}

@Component({
  selector: 'app-dialog-reset-password-usuario',
  standalone: true,
  imports: [
    MatDialogActions, MatDialogTitle, MatDialogContent, MatIconModule, MatButtonModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatTooltipModule, DatePipe, LoadingComponent,
  ],
  templateUrl: './dialog-reset-password-usuario.component.html',
  styleUrl: './dialog-reset-password-usuario.component.css'
})
export class DialogResetPasswordUsuarioComponent implements OnInit {
  readonly data = inject<IDialogResetPasswordUsuarioData>(MAT_DIALOG_DATA);
  private customerPortalService = inject(CustomerPortalService);
  private notificationService = inject(NotificationsSystemService);

  loadingUsuarios = false;
  usuarios: ICustomerUserAdmin[] = [];
  usuarioSeleccionado: ICustomerUserAdmin | null = null;

  newPassword = '';
  saving = false;
  resultado: IResetCustomerUserPasswordResponse | null = null;

  constructor(private dialogRef: MatDialogRef<DialogResetPasswordUsuarioComponent>) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loadingUsuarios = true;
    this.customerPortalService.buscarUsuariosPortal(this.data.customerId).subscribe({
      next: (resp) => {
        this.usuarios = resp.data;
        this.loadingUsuarios = false;
      },
      error: (err) => {
        this.loadingUsuarios = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo obtener los usuarios del portal.'));
      },
    });
  }

  seleccionar(usuario: ICustomerUserAdmin): void {
    this.usuarioSeleccionado = usuario;
    this.newPassword = '';
  }

  volver(): void {
    this.usuarioSeleccionado = null;
    this.newPassword = '';
  }

  get isValid(): boolean {
    return this.newPassword.trim().length >= 8;
  }

  generarAleatoria(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.newPassword = pass;
  }

  confirmar(): void {
    if (!this.usuarioSeleccionado || !this.isValid) return;
    this.saving = true;
    this.customerPortalService.resetearPasswordUsuario(this.usuarioSeleccionado.id, this.newPassword).subscribe({
      next: (resp) => {
        this.saving = false;
        this.resultado = resp.data;
      },
      error: (err) => {
        this.saving = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo resetear la contraseña del usuario.'));
      },
    });
  }

  copiarPassword(): void {
    navigator.clipboard.writeText(this.newPassword).then(() => {
      this.notificationService.showSuccess('Contraseña copiada al portapapeles.');
    });
  }

  onClose(): void {
    this.dialogRef.close(!!this.resultado);
  }

}
