import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { EmployeesService } from '../../services/employees.service';
import { LoansService } from '../../services/loans.service';
import { IEmployeeListItem } from '../../interfaces/IEmployees';
import { ILoan } from '../../interfaces/ILoans';
import { LOAN_TYPE_OPTIONS, LoanTypeLabelPipe } from '../../shared/loan-type';
import { extractErrorMessage } from '../../shared/http-error.util';

@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatTableModule,
    CurrencyPipe, DatePipe, AsyncPipe, LoanTypeLabelPipe,
  ],
  templateUrl: './prestamos.component.html',
  styleUrl: './prestamos.component.css'
})
export class PrestamosComponent implements OnInit {

  private employeesService = inject(EmployeesService);
  private loansService = inject(LoansService);
  private notificationService = inject(NotificationsSystemService);

  employeeControl = new FormControl();
  filteredEmployees!: Observable<IEmployeeListItem[]>;
  selectedEmployee: IEmployeeListItem | null = null;

  tipoOptions = LOAN_TYPE_OPTIONS;
  selectedType: number | null = null;

  estadoOptions = [
    { value: null, label: 'Todos' },
    { value: false, label: 'Abiertos' },
    { value: true, label: 'Cerrados' },
  ];
  selectedClosed: boolean | null = null;

  displayedColumns = ['trabajador', 'tipo', 'fecha', 'monto', 'saldo', 'estado', 'observacion'];
  dataSource = new MatTableDataSource<ILoan>([]);

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

  buscar(): void {
    this.loansService.listarPrestamos({
      employeeId: this.selectedEmployee?.id,
      loanType: this.selectedType ?? undefined,
      isClosed: this.selectedClosed ?? undefined,
    }).subscribe({
      next: (resp) => this.dataSource.data = resp.data,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al listar los préstamos.'))
    });
  }

  limpiar(): void {
    this.employeeControl.setValue(null);
    this.selectedEmployee = null;
    this.selectedType = null;
    this.selectedClosed = null;
    this.buscar();
  }

}
