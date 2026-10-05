import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { CatalogosGastosService } from '../../../services/catalogos-gastos.service';
import { ExpenseCategoriesService } from '../../../services/expense-categories.service';
import { ExpensesService } from '../../../services/expenses.service';
import { IBranchSales } from '../../../interfaces/IShared';
import { IExpenseCategory } from '../../../interfaces/IExpenseCategory';
import { EXPENSE_SOURCE_TYPE_OPTIONS } from '../../../shared/expense-source-type';
import { extractErrorMessage, extractValidationErrors } from '../../../shared/http-error.util';

@Component({
  selector: 'app-gasto-form',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatDatepickerModule, ReactiveFormsModule, LoadingComponent,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './gasto-form.component.html',
  styleUrl: './gasto-form.component.css'
})
export class GastoFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogosService = inject(CatalogosGastosService);
  private categoriesService = inject(ExpenseCategoriesService);
  private expensesService = inject(ExpensesService);
  private notificationService = inject(NotificationsSystemService);

  branches: IBranchSales[] = [];
  categories: IExpenseCategory[] = [];
  sourceTypeOptions = EXPENSE_SOURCE_TYPE_OPTIONS;

  expenseId: number | null = null;
  loading = false;
  saving = false;
  validationErrors: string[] = [];

  frmExpense: FormGroup = this.fb.group({
    branchSalesId: [null, Validators.required],
    expenseCategoryId: [null, Validators.required],
    sourceType: [null, Validators.required],
    expenseDate: [new Date(), Validators.required],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    hasSupportingDocument: [false],
    documentNumber: ['', Validators.maxLength(50)],
    supplierName: ['', Validators.maxLength(150)],
    observation: ['', Validators.maxLength(500)],
  });

  get esNuevo(): boolean {
    return this.expenseId === null;
  }

  get titulo(): string {
    return this.esNuevo ? 'Nuevo Gasto' : 'Editar Gasto';
  }

  ngOnInit(): void {
    this.catalogosService.obtenerSucursales().subscribe({
      next: (resp) => this.branches = resp.data,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las sucursales.')),
    });

    this.categoriesService.listar(true).subscribe({
      next: (resp) => this.categories = resp.data,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las categorías.')),
    });

    this.frmExpense.get('hasSupportingDocument')?.valueChanges.subscribe((tieneDocumento) => {
      const documentNumberControl = this.frmExpense.get('documentNumber');
      if (tieneDocumento) {
        documentNumberControl?.setValidators([Validators.required, Validators.maxLength(50)]);
      } else {
        documentNumberControl?.setValidators([Validators.maxLength(50)]);
      }
      documentNumberControl?.updateValueAndValidity();
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.expenseId = Number(idParam);
      this.cargarGasto(this.expenseId);
    }
  }

  private cargarGasto(id: number): void {
    this.loading = true;
    this.expensesService.obtenerPorId(id).subscribe({
      next: (resp) => {
        const gasto = resp.data;
        this.frmExpense.patchValue({
          branchSalesId: gasto.branchSalesId,
          expenseCategoryId: gasto.expenseCategoryId,
          sourceType: gasto.sourceType,
          expenseDate: new Date(gasto.expenseDate),
          amount: gasto.amount,
          description: gasto.description,
          hasSupportingDocument: gasto.hasSupportingDocument,
          documentNumber: gasto.documentNumber,
          supplierName: gasto.supplierName,
          observation: gasto.observation,
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el gasto.'));
      },
    });
  }

  guardar(): void {
    this.validationErrors = [];

    if (this.frmExpense.invalid) {
      this.frmExpense.markAllAsTouched();
      return;
    }

    const formValue = this.frmExpense.value;
    const request = {
      branchSalesId: formValue.branchSalesId,
      expenseCategoryId: formValue.expenseCategoryId,
      sourceType: formValue.sourceType,
      expenseDate: formValue.expenseDate instanceof Date ? formValue.expenseDate.toISOString() : formValue.expenseDate,
      amount: formValue.amount,
      description: formValue.description,
      hasSupportingDocument: formValue.hasSupportingDocument,
      documentNumber: formValue.hasSupportingDocument ? formValue.documentNumber : null,
      supplierName: formValue.supplierName || null,
      observation: formValue.observation || null,
    };

    this.saving = true;
    const request$ = this.esNuevo
      ? this.expensesService.crear(request)
      : this.expensesService.actualizar(this.expenseId!, request);

    request$.subscribe({
      next: (resp) => {
        this.saving = false;
        this.notificationService.showSuccess(this.esNuevo ? 'Gasto registrado correctamente.' : 'Gasto actualizado correctamente.');
        this.router.navigate(['/gastos/gastos']);
      },
      error: (err) => {
        this.saving = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al guardar el gasto.'));
        }
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/gastos/gastos']);
  }

}
