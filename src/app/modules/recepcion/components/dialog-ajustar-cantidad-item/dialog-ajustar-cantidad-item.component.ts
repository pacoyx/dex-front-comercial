import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationServiceService } from '../../services/notification-service.service';
import { EmisionService } from '../../services/emision.service';
import { IAdjustWorkGuideItemQuantityResponse } from '../../interfaces/IWorkGuideItemAdjust';
import { extractErrorMessage, extractValidationErrors } from '../../shared/http-error.util';

@Component({
  selector: 'app-dialog-ajustar-cantidad-item',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
  ],
  templateUrl: './dialog-ajustar-cantidad-item.component.html',
  styleUrl: './dialog-ajustar-cantidad-item.component.css'
})
export class DialogAjustarCantidadItemComponent {

  readonly data = inject<{ workGuideDetailId: number; productName?: string; cantidadActual: number }>(MAT_DIALOG_DATA);
  private emisionService = inject(EmisionService);
  private notificationService = inject(NotificationServiceService);

  form: FormGroup;
  loadingSave = false;
  validationErrors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogAjustarCantidadItemComponent>,
  ) {
    this.form = this.fb.group({
      newQuantity: [this.data.cantidadActual, [Validators.required, Validators.min(0.01)]],
      observation: [''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.value;

    this.emisionService.ajustarCantidadItemGuia(this.data.workGuideDetailId, {
      newQuantity: value.newQuantity,
      observation: value.observation || undefined,
    }).subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.notificationService.showSuccess(`Cantidad actualizada. Nuevo total: S/ ${resp.data.newTotal.toFixed(2)}`);
        this.dialogRef.close(resp.data as IAdjustWorkGuideItemQuantityResponse);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo ajustar la cantidad del ítem.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

}
