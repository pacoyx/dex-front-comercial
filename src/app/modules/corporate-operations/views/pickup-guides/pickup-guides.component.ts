import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, Observable, of, startWith, switchMap } from 'rxjs';
import { CustomDateAdapter } from '../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../core/configGlobal/custom-date-formats';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { DialogQuestionComponent } from '../../../recepcion/components/dialog-question/dialog-question.component';
import { ClientesService } from '../../../facturacion/services/clientes.service';
import { ICompanySearchResult } from '../../../facturacion/interfaces/ICustomer';
import { PickupGuidesService } from '../../services/pickup-guides.service';
import { IPickupGuideSummary } from '../../interfaces/IPickupGuide';
import {
  PICKUP_GUIDE_STATUS_OPTIONS,
  PickupGuideStatus,
  PickupGuideStatusColorPipe,
  PickupGuideStatusLabelPipe,
} from '../../shared/pickup-guide-status';
import { extractErrorMessage } from '../../shared/http-error.util';

@Component({
  selector: 'app-pickup-guides',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatAutocompleteModule,
    MatTableModule, MatDatepickerModule, ReactiveFormsModule, FormsModule, RouterModule, MatTooltipModule,
    CurrencyPipe, DatePipe, AsyncPipe, PickupGuideStatusLabelPipe, PickupGuideStatusColorPipe,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './pickup-guides.component.html',
  styleUrl: './pickup-guides.component.css'
})
export class PickupGuidesComponent implements OnInit {

  private pickupGuidesService = inject(PickupGuidesService);
  private clientesService = inject(ClientesService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  readonly rangeFrm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  customerControl = new FormControl<string | ICompanySearchResult>('');
  filteredCustomers!: Observable<ICompanySearchResult[]>;
  selectedCustomerId: number | null = null;

  statusOptions = PICKUP_GUIDE_STATUS_OPTIONS;
  selectedStatus: PickupGuideStatus | null = null;

  displayedColumns: string[] = ['guideNumber', 'customerName', 'pickupDate', 'status', 'totalAmount', 'operaciones'];
  dataSource = new MatTableDataSource<IPickupGuideSummary>([]);
  loading = false;

  ngOnInit(): void {
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

    this.buscar();
  }

  displayCustomerFn(customer: ICompanySearchResult | string): string {
    return typeof customer === 'string' ? customer : (customer?.businessName ?? '');
  }

  onCustomerSelected(event: { option: { value: ICompanySearchResult } }): void {
    this.selectedCustomerId = event.option.value.customerId;
  }

  clearCustomer(event: Event): void {
    event.stopPropagation();
    this.customerControl.setValue('');
    this.selectedCustomerId = null;
  }

  buscar(): void {
    const start = this.rangeFrm.get('start')?.value;
    const end = this.rangeFrm.get('end')?.value;

    this.loading = true;
    this.pickupGuidesService.listar({
      customerId: this.selectedCustomerId,
      status: this.selectedStatus,
      fromDate: start ? start.toISOString() : undefined,
      toDate: end ? end.toISOString() : undefined,
    }).subscribe({
      next: (resp) => {
        this.dataSource.data = resp.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al listar las guías de recojo.'));
      },
    });
  }

  limpiar(): void {
    this.rangeFrm.reset();
    this.customerControl.setValue('');
    this.selectedCustomerId = null;
    this.selectedStatus = null;
    this.buscar();
  }

  ver(guide: IPickupGuideSummary): void {
    this.router.navigate(['/corporate-operations/pickup-guides', guide.id]);
  }

  editar(guide: IPickupGuideSummary): void {
    this.router.navigate(['/corporate-operations/pickup-guides', guide.id, 'editar']);
  }

  canEdit(guide: IPickupGuideSummary): boolean {
    return guide.status === PickupGuideStatus.Draft;
  }

  canCancel(guide: IPickupGuideSummary): boolean {
    return guide.status !== PickupGuideStatus.Cancelled && guide.status !== PickupGuideStatus.Invoiced;
  }

  anular(guide: IPickupGuideSummary): void {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: {
        title: 'Anular Guía de Recojo',
        message: `¿Está seguro de anular la guía "${guide.guideNumber}"? Esta acción no se puede deshacer.`,
        msgButton: 'Anular',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'OK') {
        this.pickupGuidesService.cambiarEstado(guide.id, { status: PickupGuideStatus.Cancelled }).subscribe({
          next: () => {
            this.notificationService.showSuccess('Guía anulada correctamente.');
            this.buscar();
          },
          error: (err) => {
            this.notificationService.showError(extractErrorMessage(err, 'No se pudo anular la guía.'));
          },
        });
      }
    });
  }

}
