import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FixedAssetsService } from '../../../../services/fixed-assets.service';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../../../shared/http-error.util';

export interface DialogDisposeData {
  assetId: number;
}

@Component({
  selector: 'app-dialog-dispose-fixed-asset',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './dialog-dispose.component.html',
  styleUrl: './dialog-dispose.component.css',
})
export class DialogDisposeFixedAssetComponent {
  readonly dialogRef = inject(MatDialogRef<DialogDisposeFixedAssetComponent>);
  readonly data = inject<DialogDisposeData>(MAT_DIALOG_DATA);

  private fixedAssetsService = inject(FixedAssetsService);
  private notificationService = inject(NotificationsSystemService);

  guardando = false;

  form = new FormGroup({
    status: new FormControl<number>(3, [Validators.required]),
    disposalDate: new FormControl('', [Validators.required]),
    disposalReason: new FormControl('', [Validators.required, Validators.maxLength(300)]),
  });

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const valor = this.form.getRawValue();

    this.fixedAssetsService.darDeBaja(this.data.assetId, {
      status: valor.status!,
      disposalDate: valor.disposalDate!,
      disposalReason: valor.disposalReason!,
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.notificationService.showSuccess('Activo fijo dado de baja correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.guardando = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo dar de baja el activo fijo.'));
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
