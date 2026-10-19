import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationServiceService } from '../../services/notification-service.service';
import { MaestrosService } from '../../services/maestros.service';
import { IUbicacionesResponseDto, IWorkGuideDetailLocationResponse } from '../../interfaces/IUbicaciones';
import { extractErrorMessage, extractValidationErrors } from '../../shared/http-error.util';

@Component({
  selector: 'app-dialog-cambiar-ubicacion',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule, MatSelectModule, MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './dialog-cambiar-ubicacion.component.html',
  styleUrl: './dialog-cambiar-ubicacion.component.css'
})
export class DialogCambiarUbicacionComponent implements OnInit {

  readonly data = inject<{ workGuideDetailId: number; productName?: string; ubicacionActual?: string }>(MAT_DIALOG_DATA);
  private maestrosService = inject(MaestrosService);
  private notificationService = inject(NotificationServiceService);

  form: FormGroup;
  loadingSave = false;
  loadingUbicaciones = false;
  validationErrors: string[] = [];
  ubicaciones: IUbicacionesResponseDto[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogCambiarUbicacionComponent>,
  ) {
    this.form = this.fb.group({
      locationClothesId: [null, Validators.required],
      fechaEntregaAprox: [null],
      comments: [''],
    });
  }

  ngOnInit(): void {
    this.loadingUbicaciones = true;
    this.maestrosService.obtenerUbicaciones().subscribe({
      next: (resp) => {
        this.ubicaciones = resp.data;
        this.loadingUbicaciones = false;
      },
      error: (err) => {
        this.loadingUbicaciones = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el catálogo de ubicaciones.'));
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.value;
    const fechaEntregaAprox: Date | null = value.fechaEntregaAprox;

    this.maestrosService.asignarUbicacionDetalle(this.data.workGuideDetailId, {
      locationClothesId: value.locationClothesId,
      fechaEntregaAprox: fechaEntregaAprox ? fechaEntregaAprox.toISOString() : null,
      comments: value.comments || null,
    }).subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.notificationService.showSuccess('Ubicación actualizada correctamente.');
        this.dialogRef.close(resp.data as IWorkGuideDetailLocationResponse);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo actualizar la ubicación.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

}
