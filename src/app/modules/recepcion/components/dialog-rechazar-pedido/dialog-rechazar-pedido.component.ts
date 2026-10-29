import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationServiceService } from '../../services/notification-service.service';
import { WebOrdersService } from '../../services/web-orders.service';
import { extractErrorMessage, extractValidationErrors } from '../../shared/http-error.util';

@Component({
  selector: 'app-dialog-rechazar-pedido',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
  ],
  templateUrl: './dialog-rechazar-pedido.component.html',
  styleUrl: './dialog-rechazar-pedido.component.css'
})
export class DialogRechazarPedidoComponent {

  readonly data = inject<{ webOrderId: number; orderNumber: string }>(MAT_DIALOG_DATA);
  private webOrdersService = inject(WebOrdersService);
  private notificationService = inject(NotificationServiceService);

  form: FormGroup;
  loadingSave = false;
  validationErrors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogRechazarPedidoComponent>,
  ) {
    this.form = this.fb.group({
      reason: [''],
    });
  }

  onSubmit(): void {
    this.validationErrors = [];
    this.loadingSave = true;

    this.webOrdersService.rechazarPedido(this.data.webOrderId, {
      reason: this.form.value.reason || undefined,
    }).subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess('Pedido rechazado.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo rechazar el pedido.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

}
