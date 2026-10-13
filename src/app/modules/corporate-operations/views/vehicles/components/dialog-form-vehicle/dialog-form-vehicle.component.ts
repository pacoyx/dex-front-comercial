import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { VehiclesService } from '../../../../services/vehicles.service';
import { ICreateVehicleRequest, IUpdateVehicleRequest, IVehicle } from '../../../../interfaces/IVehicle';
import { extractErrorMessage, extractValidationErrors } from '../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-form-vehicle',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatDialogActions, MatDialogTitle, MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
  ],
  templateUrl: './dialog-form-vehicle.component.html',
  styleUrl: './dialog-form-vehicle.component.css'
})
export class DialogFormVehicleComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean, vehicle: IVehicle | null }>(MAT_DIALOG_DATA);
  private vehiclesService = inject(VehiclesService);
  private notificationService = inject(NotificationsSystemService);

  loadingSave = false;
  validationErrors: string[] = [];
  titulo = this.data.esNuevo ? 'Nuevo Vehículo' : 'Editar Vehículo';

  vehicleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormVehicleComponent>,
  ) {
    this.vehicleForm = this.fb.group({
      plate: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.data.esNuevo && this.data.vehicle) {
      this.vehicleForm.patchValue(this.data.vehicle);
    }
  }

  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      this.notificationService.showError('Debe completar los campos obligatorios.');
      return;
    }

    this.validationErrors = [];
    this.loadingSave = true;

    const request$ = this.data.esNuevo
      ? this.vehiclesService.crear(this.vehicleForm.value as ICreateVehicleRequest)
      : this.vehiclesService.actualizar(this.data.vehicle!.id, {
        ...(this.vehicleForm.value as ICreateVehicleRequest),
        isActive: this.data.vehicle!.isActive,
      } as IUpdateVehicleRequest);

    request$.subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess(this.data.esNuevo ? 'Vehículo creado correctamente.' : 'Vehículo actualizado correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar el vehículo.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
