import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { LoadingComponent } from '../../../../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../../../../core/services/notifications-system.service';
import { CustomerPortalService } from '../../../../../../../services/customer-portal.service';
import { IEnablePortalResponse } from '../../../../../../../interfaces/IPortal';
import { extractErrorMessage } from '../../../../../../../shared/http-error.util';

export interface IDialogHabilitarPortalData {
  customerId: number;
}

@Component({
  selector: 'app-dialog-habilitar-portal',
  standalone: true,
  imports: [
    MatDialogActions, MatDialogTitle, MatDialogContent, MatIconModule, MatButtonModule, FormsModule,
    MatFormFieldModule, MatInputModule, LoadingComponent,
  ],
  templateUrl: './dialog-habilitar-portal.component.html',
  styleUrl: './dialog-habilitar-portal.component.css'
})
export class DialogHabilitarPortalComponent {
  readonly data = inject<IDialogHabilitarPortalData>(MAT_DIALOG_DATA);
  private customerPortalService = inject(CustomerPortalService);
  private notificationService = inject(NotificationsSystemService);

  fullName = '';
  email = '';
  saving = false;

  constructor(
    private dialogRef: MatDialogRef<DialogHabilitarPortalComponent>,
  ) { }

  get isValid(): boolean {
    return this.fullName.trim() !== '' && this.email.trim() !== '';
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (!this.isValid) return;
    this.saving = true;
    this.customerPortalService.habilitar(this.data.customerId, { fullName: this.fullName, email: this.email }).subscribe({
      next: (resp) => {
        this.saving = false;
        this.dialogRef.close(resp.data as IEnablePortalResponse);
      },
      error: (err) => {
        this.saving = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo habilitar el portal para este cliente.'));
      },
    });
  }

}
