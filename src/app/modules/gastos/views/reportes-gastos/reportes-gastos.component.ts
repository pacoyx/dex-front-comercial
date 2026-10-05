import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter } from '../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../core/configGlobal/custom-date-formats';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { CatalogosGastosService } from '../../services/catalogos-gastos.service';
import { ExpenseCategoriesService } from '../../services/expense-categories.service';
import { ExpenseReportsService } from '../../services/expense-reports.service';
import { IBranchSales, IResponseGeneric } from '../../interfaces/IShared';
import { IExpenseCategory } from '../../interfaces/IExpenseCategory';
import {
  IExpenseAggregateRow,
  IExpenseDetailRow,
  IExpenseReportFilters,
  IExpenseReportTotals,
} from '../../interfaces/IExpenseReports';
import { EXPENSE_SOURCE_TYPE_OPTIONS, ExpenseSourceType, ExpenseSourceTypeLabelPipe } from '../../shared/expense-source-type';
import { extractErrorMessage, extractValidationErrors } from '../../shared/http-error.util';
import { descargarArchivo } from '../../shared/file-download.util';

type ReportType = 'by-period' | 'with-supporting-documents' | 'by-category' | 'by-branch';

@Component({
  selector: 'app-reportes-gastos',
  standalone: true,
  imports: [
    MatButtonModule, MatButtonToggleModule, MatIconModule, MatCardModule, MatFormFieldModule, MatSelectModule,
    MatTableModule, MatDatepickerModule, ReactiveFormsModule, FormsModule,
    CurrencyPipe, DatePipe, LoadingComponent, ExpenseSourceTypeLabelPipe,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './reportes-gastos.component.html',
  styleUrl: './reportes-gastos.component.css'
})
export class ReportesGastosComponent implements OnInit {

  private catalogosService = inject(CatalogosGastosService);
  private categoriesService = inject(ExpenseCategoriesService);
  private reportsService = inject(ExpenseReportsService);
  private notificationService = inject(NotificationsSystemService);

  readonly rangeFrm = new FormGroup({
    start: new FormControl<Date | null>(null, Validators.required),
    end: new FormControl<Date | null>(null, Validators.required),
  });

  branches: IBranchSales[] = [];
  selectedBranchId: number | null = null;

  categories: IExpenseCategory[] = [];
  selectedCategoryId: number | null = null;

  sourceTypeOptions = EXPENSE_SOURCE_TYPE_OPTIONS;
  selectedSourceType: ExpenseSourceType | null = null;

  reportTypes: { value: ReportType; label: string }[] = [
    { value: 'by-period', label: 'Por Período' },
    { value: 'with-supporting-documents', label: 'Con Documento' },
    { value: 'by-category', label: 'Por Categoría' },
    { value: 'by-branch', label: 'Por Sucursal' },
  ];
  reportType: ReportType = 'by-period';

  detailDisplayedColumns: string[] = [
    'fecha', 'sucursal', 'categoria', 'origen', 'monto', 'descripcion', 'docSustento', 'proveedor',
  ];
  aggregateDisplayedColumns: string[] = ['label', 'count', 'amount'];

  detailRows: IExpenseDetailRow[] = [];
  aggregateRows: IExpenseAggregateRow[] = [];
  totals: IExpenseReportTotals | null = null;

  loading = false;
  loadingPdf = false;
  loadingExcel = false;
  validationErrors: string[] = [];

  get esReporteDetalle(): boolean {
    return this.reportType === 'by-period' || this.reportType === 'with-supporting-documents';
  }

  ngOnInit(): void {
    this.catalogosService.obtenerSucursales().subscribe({
      next: (resp) => this.branches = resp.data,
      error: () => { },
    });

    this.categoriesService.listar().subscribe({
      next: (resp) => this.categories = resp.data,
      error: () => { },
    });

    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.rangeFrm.setValue({ start: inicioMes, end: hoy });

    this.buscar();
  }

  cambiarTipoReporte(tipo: ReportType): void {
    this.reportType = tipo;
    this.buscar();
  }

  private obtenerFiltrosValidos(): IExpenseReportFilters | null {
    this.validationErrors = [];
    const start = this.rangeFrm.get('start')?.value;
    const end = this.rangeFrm.get('end')?.value;

    if (!start || !end) {
      this.validationErrors = ['Debe seleccionar el rango de fechas (Desde / Hasta).'];
      return null;
    }
    if (end < start) {
      this.validationErrors = ['La fecha "Hasta" debe ser mayor o igual a la fecha "Desde".'];
      return null;
    }

    return {
      fromDate: start.toISOString(),
      toDate: end.toISOString(),
      branchSalesId: this.selectedBranchId,
      expenseCategoryId: this.selectedCategoryId,
      sourceType: this.selectedSourceType,
    };
  }

  buscar(): void {
    const filtros = this.obtenerFiltrosValidos();
    if (!filtros) {
      return;
    }

    this.loading = true;

    const obtener$: Observable<IResponseGeneric<any>> = this.esReporteDetalle
      ? (this.reportType === 'by-period' ? this.reportsService.obtenerPorPeriodo(filtros) : this.reportsService.obtenerConDocumento(filtros))
      : (this.reportType === 'by-category' ? this.reportsService.obtenerPorCategoria(filtros) : this.reportsService.obtenerPorSucursal(filtros));

    obtener$.subscribe({
      next: (response: any) => {
        if (this.esReporteDetalle) {
          this.detailRows = response.data.rows;
          this.aggregateRows = [];
        } else {
          this.aggregateRows = response.data.rows;
          this.detailRows = [];
        }
        this.totals = response.data.totals;
      },
      error: (err: unknown) => {
        this.detailRows = [];
        this.aggregateRows = [];
        this.totals = null;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al obtener el reporte.'));
        }
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  limpiar(): void {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.rangeFrm.setValue({ start: inicioMes, end: hoy });
    this.selectedBranchId = null;
    this.selectedCategoryId = null;
    this.selectedSourceType = null;
    this.validationErrors = [];
    this.buscar();
  }

  private nombreArchivoPorDefecto(extension: string): string {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    return `GastosReporte_${yyyy}${mm}${dd}.${extension}`;
  }

  exportarPdf(): void {
    const filtros = this.obtenerFiltrosValidos();
    if (!filtros) {
      return;
    }

    this.loadingPdf = true;
    const descargar$ = this.descargarSegunTipo(filtros, 'pdf');
    descargar$.subscribe({
      next: (response) => descargarArchivo(response, this.nombreArchivoPorDefecto('pdf')),
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al exportar el PDF.')),
      complete: () => { this.loadingPdf = false; },
    });
  }

  exportarExcel(): void {
    const filtros = this.obtenerFiltrosValidos();
    if (!filtros) {
      return;
    }

    this.loadingExcel = true;
    const descargar$ = this.descargarSegunTipo(filtros, 'excel');
    descargar$.subscribe({
      next: (response) => descargarArchivo(response, this.nombreArchivoPorDefecto('xlsx')),
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al exportar el Excel.')),
      complete: () => { this.loadingExcel = false; },
    });
  }

  private descargarSegunTipo(filtros: IExpenseReportFilters, formato: 'pdf' | 'excel') {
    switch (this.reportType) {
      case 'by-period':
        return formato === 'pdf' ? this.reportsService.descargarPorPeriodoPdf(filtros) : this.reportsService.descargarPorPeriodoExcel(filtros);
      case 'with-supporting-documents':
        return formato === 'pdf' ? this.reportsService.descargarConDocumentoPdf(filtros) : this.reportsService.descargarConDocumentoExcel(filtros);
      case 'by-category':
        return formato === 'pdf' ? this.reportsService.descargarPorCategoriaPdf(filtros) : this.reportsService.descargarPorCategoriaExcel(filtros);
      case 'by-branch':
        return formato === 'pdf' ? this.reportsService.descargarPorSucursalPdf(filtros) : this.reportsService.descargarPorSucursalExcel(filtros);
    }
  }

}
