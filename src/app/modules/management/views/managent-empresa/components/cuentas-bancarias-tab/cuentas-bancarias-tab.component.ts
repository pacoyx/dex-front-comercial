import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { CompanyBankAccountsService } from '../../../../services/company-bank-accounts.service';
import { ICompanyBankAccount } from '../../../../interfaces/ICompanyBankAccounts';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../../../shared/http-error.util';
import { DialogFormCuentaBancariaComponent } from '../dialog-form-cuenta-bancaria/dialog-form-cuenta-bancaria.component';

@Component({
  selector: 'app-cuentas-bancarias-tab',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatTableModule, MatTooltipModule],
  templateUrl: './cuentas-bancarias-tab.component.html',
  styleUrl: './cuentas-bancarias-tab.component.css'
})
export class CuentasBancariasTabComponent implements OnChanges {

  @Input() companyId: number | null = null;

  private companyBankAccountsService = inject(CompanyBankAccountsService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  cuentas: ICompanyBankAccount[] = [];
  displayedColumns: string[] = ['banco', 'tipo', 'moneda', 'numero', 'cci', 'descripcion', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<ICompanyBankAccount>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['companyId'] && this.companyId) {
      this.cargar();
    }
  }

  cargar(): void {
    if (!this.companyId) return;
    this.companyBankAccountsService.listarCuentas(this.companyId).subscribe({
      next: (resp) => {
        this.cuentas = resp.data;
        this.dataSource.data = resp.data;
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las cuentas bancarias.'));
      }
    });
  }

  agregarCuenta(): void {
    if (!this.companyId) return;
    const dialogRef = this.dialog.open(DialogFormCuentaBancariaComponent, {
      data: { esNuevo: true, obj: null, companyId: this.companyId }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.cargar();
    });
  }

  editarCuenta(cuenta: ICompanyBankAccount): void {
    if (!this.companyId) return;
    const dialogRef = this.dialog.open(DialogFormCuentaBancariaComponent, {
      data: { esNuevo: false, obj: cuenta, companyId: this.companyId }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.cargar();
    });
  }

  toggleEstado(cuenta: ICompanyBankAccount): void {
    if (!this.companyId) return;
    const accion = cuenta.isEnabled
      ? this.companyBankAccountsService.deshabilitarCuenta(this.companyId, cuenta.id)
      : this.companyBankAccountsService.habilitarCuenta(this.companyId, cuenta.id);

    accion.subscribe({
      next: () => {
        this.notificationService.showSuccess(cuenta.isEnabled ? 'Cuenta deshabilitada correctamente.' : 'Cuenta habilitada correctamente.');
        this.cargar();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo actualizar el estado de la cuenta.'));
      }
    });
  }

}
