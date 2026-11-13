import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FixedAssetsService } from '../../../../services/fixed-assets.service';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { extractErrorMessage, extractValidationErrors } from '../../../../shared/http-error.util';

export interface DialogMaintenanceData {
  assetId: number;
  /** false si el activo ya está En Mantenimiento: no se permite abrir otra parada */
  puedePonerEnMantenimiento: boolean;
}

/** fecha fin estimada >= fecha de inicio (comparando strings yyyy-MM-dd) */
const fechaFinValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const inicio = group.get('date')?.value;
  const fin = group.get('estimatedEndDate')?.value;
  if (!group.get('putAssetOutOfService')?.value || !inicio || !fin) return null;
  return fin < inicio ? { fechaFinAnterior: true } : null;
};

interface ArchivoAdjunto {
  file: File;
  sizeLabel: string;
}

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const TAMANO_MAXIMO_MB = 10;

@Component({
  selector: 'app-dialog-maintenance',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSlideToggleModule,
  ],
  templateUrl: './dialog-maintenance.component.html',
  styleUrl: './dialog-maintenance.component.css',
})
export class DialogMaintenanceComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  readonly dialogRef = inject(MatDialogRef<DialogMaintenanceComponent>);
  readonly data = inject<DialogMaintenanceData>(MAT_DIALOG_DATA);

  private fixedAssetsService = inject(FixedAssetsService);
  private notificationService = inject(NotificationsSystemService);

  archivos: ArchivoAdjunto[] = [];
  archivoErrorMessage = '';

  guardando = false;
  progresoTexto = '';
  validationErrors: string[] = [];

  form = new FormGroup({
    date: new FormControl('', [Validators.required]),
    type: new FormControl<number>(2, [Validators.required]),
    description: new FormControl('', [Validators.required, Validators.maxLength(300)]),
    cost: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
    observations: new FormControl('', [Validators.maxLength(500)]),
    nextMaintenanceDate: new FormControl(''),
    serviceProvider: new FormControl('', [Validators.maxLength(150)]),
    putAssetOutOfService: new FormControl(false, { nonNullable: true }),
    outOfServiceReason: new FormControl('', [Validators.maxLength(300)]),
    estimatedEndDate: new FormControl(''),
  }, { validators: fechaFinValidator });

  get enMantenimiento(): boolean {
    return this.form.controls.putAssetOutOfService.value;
  }

  ngOnInit(): void {
    if (!this.data.puedePonerEnMantenimiento) {
      this.form.controls.putAssetOutOfService.disable();
    }

    // Motivo y fecha fin solo son obligatorios si se deja el activo En Mantenimiento.
    this.form.controls.putAssetOutOfService.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(activo => {
        const motivo = this.form.controls.outOfServiceReason;
        const fin = this.form.controls.estimatedEndDate;
        if (activo) {
          motivo.addValidators(Validators.required);
          fin.addValidators(Validators.required);
        } else {
          motivo.removeValidators(Validators.required);
          fin.removeValidators(Validators.required);
          motivo.reset('');
          fin.reset('');
        }
        motivo.updateValueAndValidity();
        fin.updateValueAndValidity();
      });
  }

  onArchivosSeleccionados(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivos = input.files;
    if (!archivos || archivos.length === 0) return;

    this.archivoErrorMessage = '';
    Array.from(archivos).forEach((file) => {
      if (!TIPOS_PERMITIDOS.includes(file.type)) {
        this.archivoErrorMessage = `"${file.name}" no es un formato válido (jpg, png, webp o pdf).`;
        return;
      }
      if (file.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
        this.archivoErrorMessage = `"${file.name}" supera el tamaño máximo de ${TAMANO_MAXIMO_MB}MB.`;
        return;
      }
      this.archivos.push({ file, sizeLabel: this.formatSize(file.size) });
    });

    input.value = '';
  }

  quitarArchivo(archivo: ArchivoAdjunto): void {
    this.archivos = this.archivos.filter(a => a !== archivo);
  }

  private formatSize(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.validationErrors = [];
    this.guardando = true;
    const valor = this.form.getRawValue();

    this.fixedAssetsService.registrarMantenimiento(this.data.assetId, {
      date: valor.date!,
      type: valor.type!,
      description: valor.description!,
      cost: valor.cost!,
      observations: valor.observations || undefined,
      nextMaintenanceDate: valor.nextMaintenanceDate || null,
      serviceProvider: valor.serviceProvider || null,
      putAssetOutOfService: valor.putAssetOutOfService,
      outOfServiceReason: valor.putAssetOutOfService ? valor.outOfServiceReason : null,
      estimatedEndDate: valor.putAssetOutOfService ? valor.estimatedEndDate : null,
    }).subscribe({
      next: (resp) => this.subirArchivos(resp.data.id),
      error: (err) => {
        this.guardando = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo registrar el mantenimiento.'));
        }
      },
    });
  }

  private subirArchivos(maintenanceId: number): void {
    if (this.archivos.length === 0) {
      this.finalizar(0);
      return;
    }
    this.subirArchivoSecuencial(maintenanceId, 0, 0);
  }

  private subirArchivoSecuencial(maintenanceId: number, index: number, fallidos: number): void {
    if (index >= this.archivos.length) {
      this.finalizar(fallidos);
      return;
    }

    this.progresoTexto = `Subiendo archivo ${index + 1} de ${this.archivos.length}...`;
    this.fixedAssetsService.agregarAdjuntoMantenimiento(maintenanceId, this.archivos[index].file).subscribe({
      next: () => this.subirArchivoSecuencial(maintenanceId, index + 1, fallidos),
      error: () => this.subirArchivoSecuencial(maintenanceId, index + 1, fallidos + 1),
    });
  }

  private finalizar(archivosFallidos: number): void {
    this.guardando = false;
    this.progresoTexto = '';

    if (archivosFallidos > 0) {
      this.notificationService.showError(`Mantenimiento registrado, pero ${archivosFallidos} archivo(s) no se pudieron subir.`);
    } else {
      this.notificationService.showSuccess(this.enMantenimiento
        ? 'Mantenimiento registrado. El activo quedó En Mantenimiento.'
        : 'Mantenimiento registrado correctamente.');
    }
    this.dialogRef.close(true);
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
