import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CustomDateAdapter } from '../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../core/configGlobal/custom-date-formats';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { DialogQuestionComponent } from '../../../recepcion/components/dialog-question/dialog-question.component';
import { CatalogosGastosService } from '../../services/catalogos-gastos.service';
import { ExpenseCategoriesService } from '../../services/expense-categories.service';
import { ExpensesService } from '../../services/expenses.service';
import { IBranchSales } from '../../interfaces/IShared';
import { IExpenseCategory } from '../../interfaces/IExpenseCategory';
import { IExpenseSummary } from '../../interfaces/IExpense';
import {
  EXPENSE_SOURCE_TYPE_OPTIONS,
  ExpenseSourceType,
  ExpenseSourceTypeColorPipe,
  ExpenseSourceTypeLabelPipe,
} from '../../shared/expense-source-type';
import { extractErrorMessage } from '../../shared/http-error.util';
import { DialogExpenseAttachmentsComponent } from './components/dialog-expense-attachments/dialog-expense-attachments.component';

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatSelectModule,
    MatTableModule, MatDatepickerModule, ReactiveFormsModule, FormsModule, RouterModule, MatTooltipModule,
    CurrencyPipe, DatePipe, ExpenseSourceTypeLabelPipe, ExpenseSourceTypeColorPipe,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './gastos.component.html',
  styleUrl: './gastos.component.css'
})
export class GastosComponent implements OnInit {

  private catalogosService = inject(CatalogosGastosService);
  private categoriesService = inject(ExpenseCategoriesService);
  private expensesService = inject(ExpensesService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  readonly rangeFrm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  branches: IBranchSales[] = [];
  selectedBranchId: number | null = null;

  categories: IExpenseCategory[] = [];
  selectedCategoryId: number | null = null;

  sourceTypeOptions = EXPENSE_SOURCE_TYPE_OPTIONS;
  selectedSourceType: ExpenseSourceType | null = null;

  displayedColumns: string[] = [
    'fecha', 'sucursal', 'categoria', 'origen', 'monto', 'descripcion', 'docSustento', 'proveedor', 'operaciones',
  ];
  dataSource = new MatTableDataSource<IExpenseSummary>([]);
  loading = false;

  ngOnInit(): void {
    this.catalogosService.obtenerSucursales().subscribe({
      next: (resp) => this.branches = resp.data,
      error: () => { },
    });

    this.categoriesService.listar().subscribe({
      next: (resp) => this.categories = resp.data,
      error: () => { },
    });

    this.buscar();
  }

  buscar(): void {
    const start = this.rangeFrm.get('start')?.value;
    const end = this.rangeFrm.get('end')?.value;

    this.loading = true;
    this.expensesService.listar({
      dateFrom: start ? start.toISOString() : undefined,
      dateTo: end ? end.toISOString() : undefined,
      branchSalesId: this.selectedBranchId ?? undefined,
      expenseCategoryId: this.selectedCategoryId ?? undefined,
      sourceType: this.selectedSourceType,
    }).subscribe({
      next: (resp) => {
        this.dataSource.data = resp.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al listar los gastos.'));
      },
    });
  }

  limpiar(): void {
    this.rangeFrm.reset();
    this.selectedBranchId = null;
    this.selectedCategoryId = null;
    this.selectedSourceType = null;
    this.buscar();
  }

  verAdjuntos(expense: IExpenseSummary): void {
    this.dialog.open(DialogExpenseAttachmentsComponent, {
      width: '520px',
      data: { expenseId: expense.id },
    });
  }

  eliminar(expense: IExpenseSummary): void {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Gasto',
        message: `¿Está seguro de eliminar el gasto "${expense.description}"?`,
        msgButton: 'Eliminar',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'OK') {
        this.expensesService.eliminar(expense.id).subscribe({
          next: (resp) => {
            if (resp.success) {
              this.notificationService.showSuccess('Gasto eliminado.');
              this.buscar();
            }
          },
          error: (err) => {
            this.notificationService.showError(extractErrorMessage(err, 'No se pudo eliminar el gasto.'));
          },
        });
      }
    });
  }

}
