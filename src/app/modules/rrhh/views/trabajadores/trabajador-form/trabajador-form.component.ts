import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { EmployeesService } from '../../../services/employees.service';
import { CatalogosService } from '../../../services/catalogos.service';
import { IArea, IPosition } from '../../../interfaces/ICatalogos';
import { EMPLOYEE_CONTRACT_TYPE_OPTIONS } from '../../../shared/employee-contract-type';
import { extractErrorMessage, extractValidationErrors } from '../../../shared/http-error.util';

function toDateOnly(value: Date | null): string {
  if (!value) return '';
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

@Component({
  selector: 'app-trabajador-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './trabajador-form.component.html',
  styleUrl: './trabajador-form.component.css'
})
export class TrabajadorFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private employeesService = inject(EmployeesService);
  private catalogosService = inject(CatalogosService);
  private notificationService = inject(NotificationsSystemService);
  private router = inject(Router);

  areas: IArea[] = [];
  cargos: IPosition[] = [];
  contractTypeOptions = EMPLOYEE_CONTRACT_TYPE_OPTIONS;

  guardando = false;
  validationErrors: string[] = [];
  errorMessage = '';

  form: FormGroup = this.fb.group({
    code: ['', Validators.required],
    documentNumber: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    address: [''],
    birthDate: [null as Date | null, Validators.required],
    hireDate: [null as Date | null, Validators.required],
    areaId: [null, Validators.required],
    positionId: [null, Validators.required],
    contractType: [null, Validators.required],
    baseSalary: [0, [Validators.required, Validators.min(0)]],
    emergencyContacts: this.fb.array([]),
    bankAccounts: this.fb.array([]),
  });

  get emergencyContacts(): FormArray {
    return this.form.get('emergencyContacts') as FormArray;
  }

  get bankAccounts(): FormArray {
    return this.form.get('bankAccounts') as FormArray;
  }

  ngOnInit(): void {
    this.catalogosService.listarAreas(true).subscribe({ next: (r) => this.areas = r.data });
    this.catalogosService.listarCargos(true).subscribe({ next: (r) => this.cargos = r.data });
  }

  nuevoContacto(): void {
    this.emergencyContacts.push(this.fb.group({
      name: ['', Validators.required],
      relationship: ['', Validators.required],
      phoneNumber: ['', Validators.required],
    }));
  }

  quitarContacto(index: number): void {
    this.emergencyContacts.removeAt(index);
  }

  nuevaCuenta(): void {
    this.bankAccounts.push(this.fb.group({
      bankName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      cci: [''],
    }));
  }

  quitarCuenta(index: number): void {
    this.bankAccounts.removeAt(index);
  }

  guardar(): void {
    this.validationErrors = [];
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;

    if (value.hireDate && value.birthDate && new Date(value.hireDate) < new Date(value.birthDate)) {
      this.errorMessage = 'La fecha de ingreso no puede ser anterior a la fecha de nacimiento.';
      return;
    }

    this.guardando = true;
    this.employeesService.crearTrabajador({
      code: value.code,
      documentNumber: value.documentNumber,
      firstName: value.firstName,
      lastName: value.lastName,
      phoneNumber: value.phoneNumber,
      address: value.address || null,
      birthDate: toDateOnly(value.birthDate),
      hireDate: toDateOnly(value.hireDate),
      areaId: value.areaId,
      positionId: value.positionId,
      contractType: value.contractType,
      baseSalary: value.baseSalary,
      emergencyContacts: value.emergencyContacts.length ? value.emergencyContacts : null,
      bankAccounts: value.bankAccounts.length ? value.bankAccounts.map((b: any) => ({ ...b, cci: b.cci || null })) : null,
    }).subscribe({
      next: (resp) => {
        this.guardando = false;
        this.notificationService.showSuccess('Trabajador registrado correctamente.');
        this.router.navigate(['/rrhh/trabajadores', resp.data.id]);
      },
      error: (err) => {
        this.guardando = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.errorMessage = extractErrorMessage(err, 'Ocurrió un error al registrar el trabajador.');
        }
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/rrhh/trabajadores']);
  }

}
