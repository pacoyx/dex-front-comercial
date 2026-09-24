import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { CustomDateAdapter } from '../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../core/configGlobal/custom-date-formats';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { EmployeesService } from '../../services/employees.service';
import { ReportsService } from '../../services/reports.service';
import { IEmployeeListItem } from '../../interfaces/IEmployees';
import { extractErrorMessage } from '../../shared/http-error.util';
import { exportToCsv } from '../../shared/csv-export.util';

type ColumnType = 'text' | 'currency' | 'date' | 'bool' | 'incident';

interface ReportColumn {
  key: string;
  header: string;
  type: ColumnType;
}

interface ReportTypeConfig {
  key: string;
  label: string;
  columns: ReportColumn[];
  needsApprovedFilter?: boolean;
  needsClosedFilter?: boolean;
}

const REPORT_TYPES: ReportTypeConfig[] = [
  {
    key: 'payroll', label: 'Planillas',
    columns: [
      { key: 'employeeName', header: 'Trabajador', type: 'text' },
      { key: 'payrollPeriodName', header: 'Periodo', type: 'text' },
      { key: 'grossAmount', header: 'Bruto', type: 'currency' },
      { key: 'discounts', header: 'Descuentos', type: 'currency' },
      { key: 'netAmount', header: 'Neto', type: 'currency' },
      { key: 'generatedAt', header: 'Generado', type: 'date' },
    ],
  },
  {
    key: 'loans', label: 'Préstamos',
    columns: [
      { key: 'employeeName', header: 'Trabajador', type: 'text' },
      { key: 'loanDate', header: 'Fecha', type: 'date' },
      { key: 'amount', header: 'Monto', type: 'currency' },
      { key: 'balance', header: 'Saldo', type: 'currency' },
      { key: 'isClosed', header: 'Cerrado', type: 'bool' },
      { key: 'observation', header: 'Observación', type: 'text' },
    ],
    needsClosedFilter: true,
  },
  {
    key: 'advances', label: 'Adelantos',
    columns: [
      { key: 'employeeName', header: 'Trabajador', type: 'text' },
      { key: 'loanDate', header: 'Fecha', type: 'date' },
      { key: 'amount', header: 'Monto', type: 'currency' },
      { key: 'balance', header: 'Saldo', type: 'currency' },
      { key: 'isClosed', header: 'Cerrado', type: 'bool' },
      { key: 'observation', header: 'Observación', type: 'text' },
    ],
    needsClosedFilter: true,
  },
  {
    key: 'attendance', label: 'Asistencia',
    columns: [
      { key: 'employeeName', header: 'Trabajador', type: 'text' },
      { key: 'date', header: 'Fecha', type: 'date' },
      { key: 'checkIn', header: 'Entrada', type: 'text' },
      { key: 'checkOut', header: 'Salida', type: 'text' },
    ],
  },
  {
    key: 'lateArrivals', label: 'Tardanzas',
    columns: [
      { key: 'employeeName', header: 'Trabajador', type: 'text' },
      { key: 'date', header: 'Fecha', type: 'date' },
      { key: 'hours', header: 'Horas', type: 'text' },
      { key: 'observation', header: 'Observación', type: 'text' },
    ],
  },
  {
    key: 'extraHours', label: 'Horas Extra',
    columns: [
      { key: 'employeeName', header: 'Trabajador', type: 'text' },
      { key: 'date', header: 'Fecha', type: 'date' },
      { key: 'hours', header: 'Horas', type: 'text' },
      { key: 'approved', header: 'Aprobada', type: 'bool' },
      { key: 'observation', header: 'Observación', type: 'text' },
    ],
    needsApprovedFilter: true,
  },
];

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatButtonModule, MatCardModule,
    MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule,
    MatTableModule, CurrencyPipe, DatePipe, AsyncPipe,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {

  private employeesService = inject(EmployeesService);
  private reportsService = inject(ReportsService);
  private notificationService = inject(NotificationsSystemService);

  reportTypes = REPORT_TYPES;
  selectedReportType: ReportTypeConfig = REPORT_TYPES[0];

  employeeControl = new FormControl();
  filteredEmployees!: Observable<IEmployeeListItem[]>;
  selectedEmployee: IEmployeeListItem | null = null;

  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  selectedApproved: boolean | null = null;
  selectedClosed: boolean | null = null;

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<Record<string, unknown>>([]);
  buscando = false;

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
    this.onTipoChange();
  }

  displayFn(employee: IEmployeeListItem): string {
    return employee ? `${employee.firstName} ${employee.lastName} (${employee.code})` : '';
  }

  onEmployeeSelected(event: any): void {
    this.selectedEmployee = event.option.value;
  }

  onTipoChange(): void {
    this.displayedColumns = this.selectedReportType.columns.map(c => c.key);
    this.buscar();
  }

  private toDateOnly(value: Date | null): string | undefined {
    if (!value) return undefined;
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  buscar(): void {
    const startDate = this.toDateOnly(this.fechaInicio);
    const endDate = this.toDateOnly(this.fechaFin);
    const employeeId = this.selectedEmployee?.id;
    this.buscando = true;

    let request$: Observable<any>;
    switch (this.selectedReportType.key) {
      case 'payroll':
        request$ = this.reportsService.reportePlanillas({ employeeId, startDate, endDate });
        break;
      case 'loans':
        request$ = this.reportsService.reportePrestamos({ employeeId, startDate, endDate, isClosed: this.selectedClosed ?? undefined });
        break;
      case 'advances':
        request$ = this.reportsService.reporteAdelantos({ employeeId, startDate, endDate, isClosed: this.selectedClosed ?? undefined });
        break;
      case 'lateArrivals':
        request$ = this.reportsService.reporteTardanzas({ employeeId, startDate, endDate });
        break;
      case 'extraHours':
        request$ = this.reportsService.reporteHorasExtra({ employeeId, startDate, endDate, approved: this.selectedApproved ?? undefined });
        break;
      default:
        request$ = this.reportsService.reporteAsistencia({ employeeId, startDate, endDate });
        break;
    }

    request$.subscribe({
      next: (resp) => {
        this.buscando = false;
        this.dataSource.data = resp.data;
      },
      error: (err) => {
        this.buscando = false;
        this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al generar el reporte.'));
      }
    });
  }

  limpiar(): void {
    this.employeeControl.setValue(null);
    this.selectedEmployee = null;
    this.fechaInicio = null;
    this.fechaFin = null;
    this.selectedApproved = null;
    this.selectedClosed = null;
    this.buscar();
  }

  formatCell(row: Record<string, unknown>, col: ReportColumn): string {
    const value = row[col.key];
    if (value === null || value === undefined || value === '') return '-';
    switch (col.type) {
      case 'currency':
        return `S/ ${Number(value).toFixed(2)}`;
      case 'date':
        return new Date(value as string).toLocaleDateString('es-PE');
      case 'bool':
        return value ? 'Sí' : 'No';
      default:
        return String(value);
    }
  }

  exportar(): void {
    if (this.dataSource.data.length === 0) {
      this.notificationService.showError('No hay datos para exportar.');
      return;
    }
    exportToCsv(
      `reporte-${this.selectedReportType.key}.csv`,
      this.selectedReportType.columns.map(c => ({ key: c.key, header: c.header })),
      this.dataSource.data
    );
  }

}
