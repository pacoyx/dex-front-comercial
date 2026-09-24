import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../../core/services/notifications-system.service';
import { PurchaseSettingServiceService } from '../../../../../services/purchase-setting-service.service';
import { IResponseGeneric, IUnitMeasurement } from '../../../../../interfaces/IMaestros';
import { extractErrorMessage } from '../../../../../shared/http-error.util';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dialog-form-reg-unit-measurement',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './dialog-form-reg-unit-measurement.component.html',
  styleUrl: './dialog-form-reg-unit-measurement.component.css'
})
export class DialogFormRegUnitMeasurementComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean, objUnitMeasurement: IUnitMeasurement | null }>(MAT_DIALOG_DATA);
  private purchaseSettingService = inject(PurchaseSettingServiceService);
  private notificationService = inject(NotificationsSystemService);

  unitMeasurementForm: FormGroup;
  loadingSave = false;
  titulo = this.data.esNuevo ? 'Registrar Unidad de Medida' : 'Actualizar Unidad de Medida';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormRegUnitMeasurementComponent>,
  ) {
    this.unitMeasurementForm = this.fb.group({
      id: 0,
      name: ['', Validators.required],
      codeUm: ['', Validators.required],
      description: '',
      status: ['A', Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.data.esNuevo && this.data.objUnitMeasurement) {
      this.unitMeasurementForm.patchValue(this.data.objUnitMeasurement);
    }
  }

  onSubmit(): void {
    if (this.unitMeasurementForm.invalid) {
      return;
    }

    this.loadingSave = true;
    const formValue = this.unitMeasurementForm.value;

    const request$: Observable<IResponseGeneric<IUnitMeasurement> | IResponseGeneric<string>> = this.data.esNuevo
      ? this.purchaseSettingService.crearUnidadMedida(formValue)
      : this.purchaseSettingService.actualizarUnidadMedida(formValue);

    request$.subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess(
          this.data.esNuevo ? 'Unidad de medida registrada correctamente.' : 'Unidad de medida actualizada correctamente.'
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar la unidad de medida.'));
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
