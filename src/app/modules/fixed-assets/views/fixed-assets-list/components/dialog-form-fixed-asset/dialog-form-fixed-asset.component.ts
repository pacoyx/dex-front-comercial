import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, Observable, of, switchMap } from 'rxjs';
import { FixedAssetsService } from '../../../../services/fixed-assets.service';
import { IFixedAssetCategory } from '../../../../interfaces/IFixedAsset';
import { IBranchSales } from '../../../../../facturacion/interfaces/ICatalogos';
import { ManagentSystemService } from '../../../../../management/services/managent-system.service';
import { IGetUserResponse } from '../../../../../management/interfaces/IUsers';
import { PurchaseSettingServiceService } from '../../../../../purchase/services/purchase-setting-service.service';
import { ISupplierListarPorPatronResponse } from '../../../../../purchase/interfaces/IMaestros';
import { PurchaseOperationsService } from '../../../../../purchase/services/purchase-operations.service';
import { IPurchaseInvoiceListItem } from '../../../../../purchase/interfaces/IOperaciones';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { extractErrorMessage, extractValidationErrors } from '../../../../shared/http-error.util';

export interface DialogFormFixedAssetData {
  branches: IBranchSales[];
  categories: IFixedAssetCategory[];
}

@Component({
  selector: 'app-dialog-form-fixed-asset',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatAutocompleteModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './dialog-form-fixed-asset.component.html',
  styleUrl: './dialog-form-fixed-asset.component.css',
})
export class DialogFormFixedAssetComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<DialogFormFixedAssetComponent>);
  readonly data = inject<DialogFormFixedAssetData>(MAT_DIALOG_DATA);

  private fixedAssetsService = inject(FixedAssetsService);
  private managentSystemService = inject(ManagentSystemService);
  private purchaseSettingService = inject(PurchaseSettingServiceService);
  private purchaseOperationsService = inject(PurchaseOperationsService);
  private notificationService = inject(NotificationsSystemService);

  usuarios: IGetUserResponse[] = [];
  guardando = false;
  validationErrors: string[] = [];

  proveedorControl = new FormControl<ISupplierListarPorPatronResponse | string | null>(null);
  filteredProveedores!: Observable<ISupplierListarPorPatronResponse[]>;
  selectedProveedor: ISupplierListarPorPatronResponse | null = null;

  facturaControl = new FormControl('');
  filteredFacturas: IPurchaseInvoiceListItem[] = [];
  selectedFactura: IPurchaseInvoiceListItem | null = null;
  buscandoFactura = false;

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    description: new FormControl('', [Validators.maxLength(500)]),
    categoryId: new FormControl<number | null>(null, [Validators.required]),
    acquisitionDate: new FormControl('', [Validators.required]),
    acquisitionCost: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    branchId: new FormControl<number | null>(null, [Validators.required]),
    responsibleUserId: new FormControl<number | null>(null),
    usefulLifeYearsOverride: new FormControl<number | null>(null),
    notes: new FormControl('', [Validators.maxLength(500)]),
  });

  ngOnInit(): void {
    this.managentSystemService.listarUsuarios().subscribe({
      next: (resp) => (this.usuarios = resp.data ?? []),
      error: () => (this.usuarios = []),
    });

    this.filteredProveedores = this.proveedorControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => {
        if (!value || typeof value !== 'string' || value.trim() === '') return of([]);
        return this.purchaseSettingService.listarProveedoresPorPatron(value).pipe(
          switchMap(resp => of(resp.data)),
        );
      })
    );
  }

  onProveedorSelected(event: any): void {
    this.selectedProveedor = event.option.value;
  }

  displayProveedorFn(proveedor: ISupplierListarPorPatronResponse): string {
    return proveedor ? `${proveedor.name} — RUC ${proveedor.ruc}` : '';
  }

  limpiarProveedor(event: Event): void {
    event.stopPropagation();
    this.proveedorControl.setValue(null);
    this.selectedProveedor = null;
  }

  buscarFactura(): void {
    const numero = this.facturaControl.value?.trim();
    if (!numero) return;

    this.buscandoFactura = true;
    this.purchaseOperationsService.listarFacturas({ invoiceNumber: numero }).subscribe({
      next: (resp) => {
        this.buscandoFactura = false;
        this.filteredFacturas = resp.data;
      },
      error: () => {
        this.buscandoFactura = false;
        this.filteredFacturas = [];
      },
    });
  }

  seleccionarFactura(factura: IPurchaseInvoiceListItem): void {
    this.selectedFactura = factura;
    this.filteredFacturas = [];
  }

  limpiarFactura(): void {
    this.selectedFactura = null;
    this.facturaControl.setValue('');
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.validationErrors = [];
    this.guardando = true;
    const valor = this.form.getRawValue();

    this.fixedAssetsService.crear({
      name: valor.name!,
      description: valor.description || undefined,
      categoryId: valor.categoryId!,
      acquisitionDate: valor.acquisitionDate!,
      acquisitionCost: valor.acquisitionCost!,
      supplierId: this.selectedProveedor?.id ?? null,
      purchaseInvoiceId: this.selectedFactura?.id ?? null,
      branchId: valor.branchId!,
      responsibleUserId: valor.responsibleUserId ?? null,
      usefulLifeYearsOverride: valor.usefulLifeYearsOverride ?? null,
      notes: valor.notes || undefined,
    }).subscribe({
      next: (resp) => {
        this.guardando = false;
        this.notificationService.showSuccess('Activo fijo registrado correctamente.');
        this.dialogRef.close(resp.data);
      },
      error: (err) => {
        this.guardando = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo registrar el activo fijo.'));
        }
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
