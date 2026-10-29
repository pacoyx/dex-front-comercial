import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, debounceTime, map, of, switchMap } from 'rxjs';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ManagentSystemService } from '../../../../services/managent-system.service';
import { RolesService } from '../../../../services/roles.service';
import { ICreateUserRequest, IUpdateUserRequest } from '../../../../interfaces/IUsers';
import { IRole } from '../../../../../../core/interfaces/IRbac';
import { MatSelectModule } from '@angular/material/select';
import { EmployeesService } from '../../../../../rrhh/services/employees.service';
import { IEmployeeListItem } from '../../../../../rrhh/interfaces/IEmployees';

type EmpleadoOption = Pick<IEmployeeListItem, 'id' | 'firstName' | 'lastName' | 'code'>;

@Component({
  selector: 'app-dialog-add-user',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule, MatSelectModule,
    MatAutocompleteModule, AsyncPipe,
  ],
  templateUrl: './dialog-add-user.component.html',
  styleUrl: './dialog-add-user.component.css'
})
export class DialogAddUserComponent implements OnInit {


  readonly data = inject<{ esNuevo: boolean, objUsuario: any }>(MAT_DIALOG_DATA);
  usuarioService = inject(ManagentSystemService);
  private rolesService = inject(RolesService);
  private notificationService = inject(NotificationsSystemService);
  private employeesService = inject(EmployeesService);
  userForm: FormGroup;

  loadingSave = false;
  titulo = this.data.esNuevo ? 'Registrar Usuario' : 'Actualizar Usuario';

  // Roles asignados: solo aplica editando un usuario ya existente (se
  // necesita su id, que aun no existe al crear).
  availableRoles: IRole[] = [];
  selectedRoleIds: number[] = [];
  loadingRoles = false;
  savingRoles = false;

  // Empleado vinculado (opcional): necesario para que el usuario pueda operar como chofer en PickupMobile.
  employeeControl = this.fb.control<EmpleadoOption | string | null>(null);
  filteredEmployees!: Observable<EmpleadoOption[]>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogAddUserComponent>,
  ) {

    this.userForm = this.fb.group({
      id: 0,
      name: ['', Validators.required],
      userName: ['', Validators.required],
      password: [''],
      role: ['', Validators.required],
      email: '',
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userForm.reset();
    if (this.data.esNuevo) {
      this.userForm.patchValue({ status: 'A' });
    } else {
      this.userForm.patchValue(this.data.objUsuario);
      this.userForm.get('password')?.setValue('');
      this.cargarRoles();
      this.cargarEmpleadoVinculado();
    }

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

  private cargarEmpleadoVinculado(): void {
    const employeeId = this.data.objUsuario?.employeeId;
    if (!employeeId) return;

    this.employeesService.obtenerTrabajador(employeeId).subscribe({
      next: (resp) => this.employeeControl.setValue(resp.data),
      error: () => { },
    });
  }

  displayEmployeeFn(employee: EmpleadoOption | string): string {
    return typeof employee === 'string' ? employee : (employee ? `${employee.firstName} ${employee.lastName} (${employee.code})` : '');
  }

  limpiarEmpleado(): void {
    this.employeeControl.setValue(null);
  }

  private cargarRoles(): void {
    this.loadingRoles = true;
    this.rolesService.listarRoles(true).subscribe({
      next: (resp) => {
        this.availableRoles = resp.data;
        this.rolesService.obtenerRolesDeUsuario(this.data.objUsuario.id).subscribe({
          next: (rolesResp) => {
            this.selectedRoleIds = rolesResp.data.roles.map(r => r.id);
            this.loadingRoles = false;
          },
          error: () => { this.loadingRoles = false; },
        });
      },
      error: () => { this.loadingRoles = false; },
    });
  }

  guardarRoles(): void {
    this.savingRoles = true;
    this.rolesService.actualizarRolesDeUsuario(this.data.objUsuario.id, { roleIds: this.selectedRoleIds }).subscribe({
      next: () => {
        this.savingRoles = false;
        this.notificationService.showSuccess('Roles del usuario actualizados. El usuario verá el cambio la próxima vez que inicie sesión o se refresque su token.');
      },
      error: (err) => {
        this.savingRoles = false;
        this.notificationService.showError(err?.message || 'No se pudieron guardar los roles del usuario.');
      },
    });
  }


  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    if (this.data.esNuevo) {
      if (this.userForm.get('password')?.value === '') {
        this.userForm.get('password')?.setErrors({ required: true });
        return;
      }
    }


    const empleado = this.employeeControl.value;
    const employeeId = empleado && typeof empleado === 'object' ? empleado.id : null;

    const usuarioData = { ...this.userForm.value, employeeId };
    const usuarioDataCreate: ICreateUserRequest = usuarioData;
    const usuarioidataUpdate: IUpdateUserRequest = usuarioData;

    console.log('===>',usuarioData);
    

    this.loadingSave = true;

    const request$ = this.data.esNuevo
      ? this.usuarioService.crearUsuario(usuarioDataCreate)
      : this.usuarioService.actualizarUsuario(usuarioidataUpdate);

    request$.subscribe({
      next: (resp: any) => {
        console.log(resp);

        this.loadingSave = false;
        this.dialogRef.close(resp.success);
      },
      error: (err: any) => {
        console.log(err);
        this.loadingSave = false;
      }
    });
  }


  onCancel(): void {
    this.dialogRef.close();
  }

}
