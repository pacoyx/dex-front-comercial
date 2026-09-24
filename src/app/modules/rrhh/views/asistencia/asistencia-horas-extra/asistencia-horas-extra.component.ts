import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { EmployeesService } from '../../../services/employees.service';
import { AttendanceService } from '../../../services/attendance.service';
import { IEmployeeListItem } from '../../../interfaces/IEmployees';
import { IExtraHour } from '../../../interfaces/IAttendance';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { DialogHoraExtraComponent } from '../../trabajadores/trabajador-detail/components/dialog-hora-extra/dialog-hora-extra.component';

@Component({
  selector: 'app-asistencia-horas-extra',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatButtonModule, MatCardModule,
    MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule,
    MatTableModule, DatePipe, AsyncPipe,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './asistencia-horas-extra.component.html',
  styleUrl: './asistencia-horas-extra.component.css'
})
export class AsistenciaHorasExtraComponent implements OnInit {

  private employeesService = inject(EmployeesService);
  private attendanceService = inject(AttendanceService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  employeeControl = new FormControl();
  filteredEmployees!: Observable<IEmployeeListItem[]>;
  selectedEmployee: IEmployeeListItem | null = null;

  estadoOptions = [
    { value: null, label: 'Todas' },
    { value: false, label: 'Pendientes' },
    { value: true, label: 'Aprobadas' },
  ];
  selectedApproved: boolean | null = false;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  displayedColumns = ['fecha', 'trabajador', 'horas', 'observacion', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<IExtraHour>([]);

  ngOnInit(): void {
    this.filteredEmployees = this.employeeControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => {
        if (!value || (typeof value === 'string' && value.trim() === '')) return of([]);
        if (typeof value === 'object') return of([value]);
        return this.employeesService.listarTrabajadores({ search: value, pageSize: 10, onlyActive: true }).pipe(
          map(response => response.data.employees)
        );
      })
    );
    this.buscar();
  }

  displayFn(employee: IEmployeeListItem): string {
    return employee ? `${employee.firstName} ${employee.lastName} (${employee.code})` : '';
  }

  onEmployeeSelected(event: any): void {
    this.selectedEmployee = event.option.value;
  }

  private toDateOnly(value: Date | null): string | undefined {
    if (!value) return undefined;
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  buscar(): void {
    this.attendanceService.listarHorasExtra({
      employeeId: this.selectedEmployee?.id,
      approved: this.selectedApproved ?? undefined,
      startDate: this.toDateOnly(this.fechaInicio),
      endDate: this.toDateOnly(this.fechaFin),
    }).subscribe({
      next: (resp) => this.dataSource.data = resp.data,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al listar las horas extra.'))
    });
  }

  limpiar(): void {
    this.employeeControl.setValue(null);
    this.selectedEmployee = null;
    this.selectedApproved = false;
    this.fechaInicio = null;
    this.fechaFin = null;
    this.buscar();
  }

  registrarHoraExtra(): void {
    if (!this.selectedEmployee) {
      this.notificationService.showError('Selecciona un trabajador para registrar una hora extra.');
      return;
    }
    const dialogRef = this.dialog.open(DialogHoraExtraComponent, { data: { employeeId: this.selectedEmployee.id } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.buscar();
    });
  }

  aprobar(item: IExtraHour): void {
    this.attendanceService.aprobarHoraExtra(item.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Hora extra aprobada correctamente.');
        this.buscar();
      },
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudo aprobar la hora extra.'))
    });
  }

}
