import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { EmployeesService } from '../../../services/employees.service';
import { AttendanceService } from '../../../services/attendance.service';
import { IEmployeeListItem } from '../../../interfaces/IEmployees';
import { IAttendanceRecord } from '../../../interfaces/IAttendance';
import { extractErrorMessage } from '../../../shared/http-error.util';

function toDateOnly(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function currentTime(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

@Component({
  selector: 'app-asistencia-marcacion',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatButtonModule, MatCardModule,
    MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule, DatePipe, AsyncPipe,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './asistencia-marcacion.component.html',
  styleUrl: './asistencia-marcacion.component.css'
})
export class AsistenciaMarcacionComponent {

  private employeesService = inject(EmployeesService);
  private attendanceService = inject(AttendanceService);
  private notificationService = inject(NotificationsSystemService);

  employeeControl = new FormControl();
  filteredEmployees!: Observable<IEmployeeListItem[]>;
  selectedEmployee: IEmployeeListItem | null = null;

  fecha = new Date();
  registroDelDia: IAttendanceRecord | null = null;
  cargandoRegistro = false;
  marcando = false;

  constructor() {
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
          map(response => response.data.employees)
        );
      })
    );
  }

  displayFn(employee: IEmployeeListItem): string {
    return employee ? `${employee.firstName} ${employee.lastName} (${employee.code})` : '';
  }

  onEmployeeSelected(event: any): void {
    this.selectedEmployee = event.option.value;
    this.cargarRegistroDelDia();
  }

  onFechaChange(): void {
    if (this.selectedEmployee) this.cargarRegistroDelDia();
  }

  cargarRegistroDelDia(): void {
    if (!this.selectedEmployee) return;
    const fechaStr = toDateOnly(this.fecha);
    this.cargandoRegistro = true;
    this.attendanceService.listarAsistencia({
      employeeId: this.selectedEmployee.id,
      startDate: fechaStr,
      endDate: fechaStr,
    }).subscribe({
      next: (resp) => {
        this.cargandoRegistro = false;
        this.registroDelDia = resp.data.length > 0 ? resp.data[0] : null;
      },
      error: (err) => {
        this.cargandoRegistro = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo consultar la marcación del día.'));
      }
    });
  }

  marcarEntrada(): void {
    this.marcar(currentTime(), null);
  }

  marcarSalida(): void {
    this.marcar(null, currentTime());
  }

  private marcar(checkIn: string | null, checkOut: string | null): void {
    if (!this.selectedEmployee) return;
    this.marcando = true;
    this.attendanceService.marcar({
      employeeId: this.selectedEmployee.id,
      date: toDateOnly(this.fecha),
      checkIn,
      checkOut,
    }).subscribe({
      next: (resp) => {
        this.marcando = false;
        this.registroDelDia = resp.data;
        this.notificationService.showSuccess(checkIn ? 'Entrada marcada correctamente.' : 'Salida marcada correctamente.');
      },
      error: (err) => {
        this.marcando = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo registrar la marcación.'));
      }
    });
  }

}
