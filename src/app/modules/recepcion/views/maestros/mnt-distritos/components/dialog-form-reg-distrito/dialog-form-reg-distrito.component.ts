import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { NotificationServiceService } from '../../../../../services/notification-service.service';
import { WebOrdersService } from '../../../../../services/web-orders.service';
import { IDistrictAdmin, IZone } from '../../../../../interfaces/IDistrict';
import { extractErrorMessage, extractValidationErrors } from '../../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-form-reg-distrito',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule, MatSelectModule, MatCheckboxModule,
  ],
  templateUrl: './dialog-form-reg-distrito.component.html',
  styleUrl: './dialog-form-reg-distrito.component.css'
})
export class DialogFormRegDistritoComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean; distrito: IDistrictAdmin | null }>(MAT_DIALOG_DATA);
  private webOrdersService = inject(WebOrdersService);
  private notificationService = inject(NotificationServiceService);

  form: FormGroup;
  loadingSave = false;
  loadingZonas = false;
  validationErrors: string[] = [];
  zonas: IZone[] = [];
  titulo = this.data.esNuevo ? 'Nuevo Distrito' : 'Editar Distrito';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormRegDistritoComponent>,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      zoneId: [null, Validators.required],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.loadingZonas = true;
    this.webOrdersService.obtenerZonas().subscribe({
      next: (resp) => {
        this.zonas = resp.data;
        this.loadingZonas = false;
      },
      error: (err) => {
        this.loadingZonas = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el catálogo de zonas.'));
      }
    });

    if (!this.data.esNuevo && this.data.distrito) {
      this.form.patchValue(this.data.distrito);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.value;

    const request$ = this.data.esNuevo
      ? this.webOrdersService.crearDistrito({ name: value.name, zoneId: value.zoneId })
      : this.webOrdersService.actualizarDistrito(this.data.distrito!.id, { name: value.name, zoneId: value.zoneId, isActive: value.isActive });

    request$.subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.notificationService.showSuccess(this.data.esNuevo ? 'Distrito creado correctamente.' : 'Distrito actualizado correctamente.');
        this.dialogRef.close(resp.data);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar el distrito.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

}
