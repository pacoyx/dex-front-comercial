import { Component, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FixedAssetsService } from '../../../../services/fixed-assets.service';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { extractErrorMessage, extractValidationErrors } from '../../../../shared/http-error.util';
import { IFixedAssetMaintenance } from '../../../../interfaces/IFixedAsset';

export interface DialogFinishMaintenanceData {
  maintenance: IFixedAssetMaintenance;
}

function hoyISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

@Component({
  selector: 'app-dialog-finish-maintenance',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, DatePipe, DecimalPipe,
  ],
  templateUrl: './dialog-finish-maintenance.component.html',
  styleUrl: './dialog-finish-maintenance.component.css',
})
export class DialogFinishMaintenanceComponent {
  readonly dialogRef = inject(MatDialogRef<DialogFinishMaintenanceComponent>);
  readonly data = inject<DialogFinishMaintenanceData>(MAT_DIALOG_DATA);

  private fixedAssetsService = inject(FixedAssetsService);
  private notificationService = inject(NotificationsSystemService);

  guardando = false;
  validationErrors: string[] = [];

  /** yyyy-MM-dd de la fecha de inicio, para el [min] del input */
  readonly fechaInicio = this.data.maintenance.date.substring(0, 10);

  form = new FormGroup({
    actualEndDate: new FormControl(hoyISO(), [
      Validators.required,
      (c: AbstractControl): ValidationErrors | null =>
        c.value && c.value < this.fechaInicio ? { anteriorAlInicio: true } : null,
    ]),
    finalCost: new FormControl<number | null>(this.data.maintenance.cost, [Validators.min(0)]),
    closingNotes: new FormControl('', [Validators.maxLength(500)]),
  });

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.validationErrors = [];
    this.guardando = true;
    const valor = this.form.getRawValue();

    this.fixedAssetsService.finalizarMantenimiento(this.data.maintenance.id, {
      actualEndDate: valor.actualEndDate!,
      finalCost: valor.finalCost,
      closingNotes: valor.closingNotes || null,
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.notificationService.showSuccess('Mantenimiento finalizado. El activo volvió a estar operativo.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.guardando = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo finalizar el mantenimiento.'));
        }
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
