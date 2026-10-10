import { Component, effect, inject, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, Observable, of, startWith, switchMap } from 'rxjs';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { ClientesService } from '../../../../facturacion/services/clientes.service';
import { CatalogosService } from '../../../../facturacion/services/catalogos.service';
import { ICompanySearchResult } from '../../../../facturacion/interfaces/ICustomer';
import { PickupGuidesService } from '../../../services/pickup-guides.service';
import { CustomerActivePriceListService } from '../../../services/customer-active-price-list.service';
import { ICustomerPriceListDetail } from '../../../interfaces/ICustomerPriceList';
import { IPickupGuideStoreDetailLine } from '../../../interfaces/IPickupGuide';
import { extractErrorMessage, extractValidationErrors } from '../../../shared/http-error.util';
import { PickupGuideDetailStoreService } from './pickup-guide-detail-store.service';
import { DialogAddItemGuideComponent } from './components/dialog-add-item-guide/dialog-add-item-guide.component';

interface IBranchOption {
  id: number;
  description: string;
}

@Component({
  selector: 'app-pickup-guide-form',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatAutocompleteModule, MatDatepickerModule, MatTableModule, MatTooltipModule, ReactiveFormsModule,
    FormsModule, RouterModule, LoadingComponent, CurrencyPipe, DecimalPipe, AsyncPipe,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './pickup-guide-form.component.html',
  styleUrl: './pickup-guide-form.component.css'
})
export class PickupGuideFormComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pickupGuidesService = inject(PickupGuidesService);
  private activePriceListService = inject(CustomerActivePriceListService);
  private clientesService = inject(ClientesService);
  private catalogosService = inject(CatalogosService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);
  readonly store = inject(PickupGuideDetailStoreService);

  guideId: number | null = null;
  loading = false;
  saving = false;
  validationErrors: string[] = [];

  customerControl = new FormControl<string | ICompanySearchResult>('');
  filteredCustomers!: Observable<ICompanySearchResult[]>;
  selectedCustomer: ICompanySearchResult | null = null;
  customerNameReadonly = '';

  branches: IBranchOption[] = [];
  branchSalesId: number | null = null;
  pickupDate: Date = new Date();
  observation = '';

  priceListDetails: ICustomerPriceListDetail[] = [];
  priceListLoaded = false;
  loadingPriceList = false;
  isPesoMap = new Map<number, boolean>();

  dataSource = new MatTableDataSource<IPickupGuideStoreDetailLine>([]);
  displayedColumns: string[] = ['serviceItemName', 'quantity', 'weight', 'unitPrice', 'lineTotal', 'acciones'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.store.items();
      this.dataSource._updateChangeSubscription();
    });
  }

  get esNuevo(): boolean {
    return this.guideId === null;
  }

  get titulo(): string {
    return this.esNuevo ? 'Nueva Guía de Recojo' : 'Editar Guía de Recojo';
  }

  ngOnInit(): void {
    this.store.resetState();

    this.filteredCustomers = this.customerControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return of([]);
        }
        return this.clientesService.buscarEmpresas({ businessName: value }).pipe(
          switchMap(resp => of(resp.data ?? []))
        );
      })
    );

    this.catalogosService.obtenerSucursales().subscribe({
      next: (resp) => this.branches = resp.data,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las sucursales.')),
    });

    this.catalogosService.listarCatalogoServicios().subscribe({
      next: (resp) => {
        this.isPesoMap = new Map((resp.data?.servicios ?? []).map(s => [s.id, (s.isPeso ?? '').trim().toUpperCase() === 'S']));
      },
      error: () => { },
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.guideId = Number(idParam);
      this.cargarGuia(this.guideId);
    }
  }

  displayCustomerFn(customer: ICompanySearchResult | string): string {
    return typeof customer === 'string' ? customer : (customer?.businessName ?? '');
  }

  onCustomerSelected(event: { option: { value: ICompanySearchResult } }): void {
    this.selectedCustomer = event.option.value;
    this.cargarTarifaActiva(this.selectedCustomer.customerId);
  }

  private cargarTarifaActiva(customerId: number): void {
    this.loadingPriceList = true;
    this.priceListLoaded = false;
    this.priceListDetails = [];
    this.activePriceListService.obtenerActiva(customerId).subscribe({
      next: (resp) => {
        this.loadingPriceList = false;
        this.priceListLoaded = true;
        this.priceListDetails = resp.data?.details ?? [];
      },
      error: (err) => {
        this.loadingPriceList = false;
        this.priceListLoaded = false;
        if (err?.status === 404) {
          this.notificationService.showError('Este cliente no tiene una tarifa activa. No se pueden agregar ítems.');
          return;
        }
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo obtener la tarifa activa del cliente.'));
      },
    });
  }

  private cargarGuia(id: number): void {
    this.loading = true;
    this.pickupGuidesService.obtenerPorId(id).subscribe({
      next: (resp) => {
        const guia = resp.data;
        this.customerNameReadonly = guia.customerName;
        this.branchSalesId = guia.branchSalesId;
        this.pickupDate = new Date(guia.pickupDate);
        this.observation = guia.observation ?? '';

        this.store.loadItems((guia.details ?? []).map((d, idx) => ({
          item: idx + 1,
          serviceItemId: d.serviceItemId,
          serviceItemName: d.serviceItemName,
          isPeso: this.isPesoMap.get(d.serviceItemId) ?? (d.weight != null),
          unitPrice: d.unitPrice,
          quantity: d.quantity,
          weight: d.weight ?? null,
          observation: d.observation ?? null,
          lineTotal: d.total,
        })));

        this.cargarTarifaActiva(guia.customerId);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar la guía de recojo.'));
      },
    });
  }

  agregarItem(): void {
    const dialogRef = this.dialog.open(DialogAddItemGuideComponent, {
      data: { isAdd: true, objDetail: null, priceListDetails: this.priceListDetails, isPesoMap: this.isPesoMap },
    });
    dialogRef.afterClosed().subscribe();
  }

  editarItem(item: IPickupGuideStoreDetailLine): void {
    const dialogRef = this.dialog.open(DialogAddItemGuideComponent, {
      data: { isAdd: false, objDetail: item, priceListDetails: this.priceListDetails, isPesoMap: this.isPesoMap },
    });
    dialogRef.afterClosed().subscribe();
  }

  eliminarItem(item: IPickupGuideStoreDetailLine): void {
    this.store.deleteItem(item.item);
  }

  guardar(): void {
    this.validationErrors = [];

    if (this.esNuevo && !this.selectedCustomer) {
      this.notificationService.showError('Selecciona un cliente.');
      return;
    }
    if (!this.branchSalesId) {
      this.notificationService.showError('Selecciona una sucursal.');
      return;
    }
    if (this.store.items().length === 0) {
      this.notificationService.showError('Agrega al menos un ítem a la guía.');
      return;
    }

    const details = this.store.items().map(i => ({
      serviceItemId: i.serviceItemId,
      quantity: i.quantity,
      weight: i.weight,
      observation: i.observation,
    }));

    this.saving = true;

    if (this.esNuevo) {
      this.pickupGuidesService.crear({
        customerId: this.selectedCustomer!.customerId,
        branchSalesId: this.branchSalesId,
        pickupDate: this.pickupDate.toISOString(),
        observation: this.observation || null,
        details,
      }).subscribe({
        next: (resp) => {
          this.saving = false;
          this.notificationService.showSuccess('Guía de recojo registrada correctamente.');
          this.router.navigate(['/corporate-operations/pickup-guides', resp.data.id]);
        },
        error: (err) => this.manejarErrorGuardado(err),
      });
    } else {
      this.pickupGuidesService.actualizar(this.guideId!, {
        branchSalesId: this.branchSalesId,
        pickupDate: this.pickupDate.toISOString(),
        observation: this.observation || null,
        details,
      }).subscribe({
        next: () => {
          this.saving = false;
          this.notificationService.showSuccess('Guía de recojo actualizada correctamente.');
          this.router.navigate(['/corporate-operations/pickup-guides', this.guideId]);
        },
        error: (err) => this.manejarErrorGuardado(err),
      });
    }
  }

  private manejarErrorGuardado(err: unknown): void {
    this.saving = false;
    const validation = extractValidationErrors(err);
    if (validation.length > 0) {
      this.validationErrors = validation;
    } else {
      this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al guardar la guía de recojo.'));
    }
  }

  cancelar(): void {
    this.router.navigate(['/corporate-operations/pickup-guides']);
  }

}
