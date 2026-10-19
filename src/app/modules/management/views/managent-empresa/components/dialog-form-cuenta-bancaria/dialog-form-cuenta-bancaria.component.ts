import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { BankCatalogsService } from '../../../../services/bank-catalogs.service';
import { CompanyBankAccountsService } from '../../../../services/company-bank-accounts.service';
import { IBankAccountTypeLookup, IBankLookup } from '../../../../interfaces/IBanks';
import { COMPANY_BANK_ACCOUNT_CURRENCIES, ICompanyBankAccount } from '../../../../interfaces/ICompanyBankAccounts';
import { extractErrorMessage, extractValidationErrors } from '../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-form-cuenta-bancaria',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule, MatSelectModule,
  ],
  templateUrl: './dialog-form-cuenta-bancaria.component.html',
  styleUrl: './dialog-form-cuenta-bancaria.component.css'
})
export class DialogFormCuentaBancariaComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean; obj: ICompanyBankAccount | null; companyId: number }>(MAT_DIALOG_DATA);
  private bankCatalogsService = inject(BankCatalogsService);
  private companyBankAccountsService = inject(CompanyBankAccountsService);
  private notificationService = inject(NotificationsSystemService);

  form: FormGroup;
  loadingSave = false;
  loadingLookups = false;
  validationErrors: string[] = [];
  titulo = this.data.esNuevo ? 'Agregar Cuenta Bancaria' : 'Editar Cuenta Bancaria';
  monedas = COMPANY_BANK_ACCOUNT_CURRENCIES;
  bancos: IBankLookup[] = [];
  tiposCuenta: IBankAccountTypeLookup[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormCuentaBancariaComponent>,
  ) {
    this.form = this.fb.group({
      bankId: [null, Validators.required],
      bankAccountTypeId: [null, Validators.required],
      currencyId: ['PEN', Validators.required],
      accountNumber: ['', [Validators.required, Validators.maxLength(30)]],
      interbankAccountNumber: ['', Validators.maxLength(30)],
      description: ['', Validators.maxLength(200)],
      notes: ['', Validators.maxLength(500)],
    });
  }

  ngOnInit(): void {
    this.loadingLookups = true;
    forkJoin({
      bancos: this.bankCatalogsService.listarBancosLookup(),
      tipos: this.bankCatalogsService.listarTiposCuentaLookup(),
    }).subscribe({
      next: ({ bancos, tipos }) => {
        this.bancos = bancos;
        this.tiposCuenta = tipos;
        // Si se edita una cuenta cuyo banco/tipo fue desactivado despues de creada la cuenta,
        // el lookup (solo activos) no lo trae: se agrega igual para que el select lo muestre.
        if (this.data.obj && !this.bancos.some(b => b.id === this.data.obj!.bankId)) {
          this.bancos = [...this.bancos, { id: this.data.obj.bankId, name: this.data.obj.bankName }];
        }
        if (this.data.obj && !this.tiposCuenta.some(t => t.id === this.data.obj!.bankAccountTypeId)) {
          this.tiposCuenta = [...this.tiposCuenta, { id: this.data.obj.bankAccountTypeId, name: this.data.obj.bankAccountTypeName }];
        }
        this.loadingLookups = false;
      },
      error: (err) => {
        this.loadingLookups = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar los catálogos de bancos.'));
      }
    });

    if (!this.data.esNuevo && this.data.obj) {
      this.form.patchValue({
        bankId: this.data.obj.bankId,
        bankAccountTypeId: this.data.obj.bankAccountTypeId,
        currencyId: this.data.obj.currencyId,
        accountNumber: this.data.obj.accountNumber,
        interbankAccountNumber: this.data.obj.interbankAccountNumber,
        description: this.data.obj.description,
        notes: this.data.obj.notes,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.value;
    const req = {
      bankId: value.bankId,
      bankAccountTypeId: value.bankAccountTypeId,
      currencyId: value.currencyId,
      accountNumber: value.accountNumber,
      interbankAccountNumber: value.interbankAccountNumber || null,
      description: value.description || null,
      notes: value.notes || null,
    };

    const request$ = this.data.esNuevo
      ? this.companyBankAccountsService.crearCuenta(this.data.companyId, req)
      : this.companyBankAccountsService.actualizarCuenta(this.data.companyId, this.data.obj!.id, req);

    request$.subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess(
          this.data.esNuevo ? 'Cuenta bancaria agregada correctamente.' : 'Cuenta bancaria actualizada correctamente.'
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar la cuenta bancaria.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
