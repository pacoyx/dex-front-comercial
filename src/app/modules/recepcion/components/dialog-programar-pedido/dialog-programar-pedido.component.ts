import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, debounceTime, map, of, switchMap } from 'rxjs';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationServiceService } from '../../services/notification-service.service';
import { WebOrdersService } from '../../services/web-orders.service';
import { VehiclesService } from '../../../corporate-operations/services/vehicles.service';
import { EmployeesService } from '../../../rrhh/services/employees.service';
import { IVehicle } from '../../../corporate-operations/interfaces/IVehicle';
import { IEmployeeListItem } from '../../../rrhh/interfaces/IEmployees';
import { extractErrorMessage, extractValidationErrors } from '../../shared/http-error.util';

function employeeRequiredValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return value && typeof value === 'object' && 'id' in value ? null : { required: true };
}

@Component({
  selector: 'app-dialog-programar-pedido',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule, MatSelectModule, MatAutocompleteModule,
    AsyncPipe,
  ],
  templateUrl: './dialog-programar-pedido.component.html',
  styleUrl: './dialog-programar-pedido.component.css'
})
export class DialogProgramarPedidoComponent implements OnInit {

  readonly data = inject<{ webOrderId: number; orderNumber: string }>(MAT_DIALOG_DATA);
  private webOrdersService = inject(WebOrdersService);
  private vehiclesService = inject(VehiclesService);
  private employeesService = inject(EmployeesService);
  private notificationService = inject(NotificationServiceService);

  form: FormGroup;
  employeeControl = this.fb.control<IEmployeeListItem | string | null>(null, [employeeRequiredValidator]);
  filteredEmployees!: Observable<IEmployeeListItem[]>;
  vehiculos: IVehicle[] = [];

  loadingSave = false;
  loadingVehiculos = false;
  validationErrors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogProgramarPedidoComponent>,
  ) {
    this.form = this.fb.group({
      vehicleId: [null, Validators.required],
      scheduledPickupDate: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadingVehiculos = true;
    this.vehiclesService.listar().subscribe({
      next: (resp) => {
        this.vehiculos = resp.data;
        this.loadingVehiculos = false;
      },
      error: (err) => {
        this.loadingVehiculos = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar la lista de vehículos.'));
      }
    });

    this.filteredEmployees = this.employeeControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return of([]);
        }
        if (typeof value === 'object') {
          return of([value]);
        }
        return this.employeesService.listarTrabajadores({ search: value, pageSize: 10, onlyActive: true }).pipe(
          map(resp => resp.data.employees)
        );
      })
    );
  }

  displayEmployeeFn(employee: IEmployeeListItem | string): string {
    return typeof employee === 'string' ? employee : (employee ? `${employee.firstName} ${employee.lastName} (${employee.code})` : '');
  }

  onSubmit(): void {
    this.employeeControl.markAsTouched();
    if (this.form.invalid || this.employeeControl.invalid) return;

    const empleado = this.employeeControl.value as IEmployeeListItem;
    const fechaStr: string = this.form.value.scheduledPickupDate;

    this.validationErrors = [];
    this.loadingSave = true;

    this.webOrdersService.programarPedido(this.data.webOrderId, {
      vehicleId: this.form.value.vehicleId,
      employeeId: empleado.id,
      scheduledPickupDate: new Date(fechaStr).toISOString(),
    }).subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess('Logística programada correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo programar la logística del pedido.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

}
