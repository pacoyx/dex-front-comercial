import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Observable, of } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { CustomDateAdapter } from '../../../config/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../config/custom-date-formats';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { InspeccionService } from '../../../services/inspeccion.service';
import { MaestrosService } from '../../../services/maestros.service';
import { EmisionService } from '../../../services/emision.service';
import { SneakerBrandResponse, SneakerReportFilters, SneakerReportGroupResponse, WorkGuidePhotoResponse } from '../../../interfaces/IInspeccion';
import { ISucursalesCombo } from '../../../interfaces/IReports';
import { IClienteBusqueda } from '../../../components/dialog-cliente/dialog-cliente.component';
import { extractErrorMessage, extractValidationErrors } from '../../../shared/http-error.util';
import { DialogVerFotosComponent } from '../inspeccion-resumen/components/dialog-ver-fotos/dialog-ver-fotos.component';

const DELIVERY_STATUS_LABEL: Record<string, string> = {
  Pending: 'Pendiente',
  Delivered: 'Entregado'
};

@Component({
  selector: 'app-reporte-sneakers',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatCheckboxModule, MatDatepickerModule, MatAutocompleteModule,
    MatTableModule, MatCardModule, LoadingComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('180ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ]),
  ],
  templateUrl: './reporte-sneakers.component.html',
  styleUrl: './reporte-sneakers.component.css'
})
export class ReporteSneakersComponent implements OnInit, OnDestroy {

  private inspeccionService = inject(InspeccionService);
  private maestrosService = inject(MaestrosService);
  private emisionService = inject(EmisionService);
  private dialog = inject(MatDialog);

  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  branchId: number | null = null;
  brandId: number | null = null;
  customerId: number | null = null;
  ticketStatus: 'P' | 'E' | 'F' | null = null;
  pendingDelivery = true;

  sucursales: ISucursalesCombo[] = [];
  marcas: SneakerBrandResponse[] = [];

  clienteControl = new FormControl();
  filteredClientes!: Observable<IClienteBusqueda[]>;

  displayedColumns: string[] = [
    'workGuideNumber', 'workGuideDate', 'customerName', 'sneakerCount', 'deliveryStatus', 'photoCount', 'expand'
  ];
  dataSource = new MatTableDataSource<SneakerReportGroupResponse>([]);
  expandedGroup: SneakerReportGroupResponse | null = null;

  // Cache por guia: una vez cargadas las fotos de una guia no se vuelven a pedir al
  // volver a expandir la misma fila en esta misma sesion de la pantalla.
  fotosPorGuia = new Map<number, WorkGuidePhotoResponse[]>();
  fotoUrlsPorGuia = new Map<number, Map<number, string>>();
  cargandoFotosGuiaId: number | null = null;

  loading = false;
  errorMessage = '';
  validationErrors: string[] = [];

  ngOnInit(): void {
    this.maestrosService.obtenerSucursalesCombo().subscribe({
      next: (resp) => this.sucursales = resp.data,
      error: (err) => console.log(err)
    });
    this.inspeccionService.listarMarcasZapatilla().subscribe({
      next: (resp) => this.marcas = resp.data,
      error: (err) => console.log(err)
    });

    this.filteredClientes = this.clienteControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        if (!value) {
          return of([]);
        }
        return this.emisionService.filtrarClientesPorPatron(value).pipe(
          map(response => response.data)
        );
      })
    );
  }

  onClienteSelected(event: any): void {
    const cliente = event.option.value;
    this.customerId = cliente.id;
  }

  displayFn(cliente: any): string {
    return cliente && cliente.nombres && cliente.apellidos ? `${cliente.nombres} ${cliente.apellidos}` : cliente;
  }

  limpiarCliente(): void {
    this.customerId = null;
    this.clienteControl.setValue('');
  }

  ngOnDestroy(): void {
    this.fotoUrlsPorGuia.forEach((urls) => urls.forEach((url) => URL.revokeObjectURL(url)));
  }

  traducirEstadoEntrega(estado: string): string {
    return DELIVERY_STATUS_LABEL[estado] ?? estado;
  }

  serieDeGuia(workGuideNumber: string): string {
    const idx = workGuideNumber.indexOf('-');
    return idx >= 0 ? workGuideNumber.substring(0, idx) : workGuideNumber;
  }

  numeroDeGuia(workGuideNumber: string): string {
    const idx = workGuideNumber.indexOf('-');
    return idx >= 0 ? workGuideNumber.substring(idx + 1) : '';
  }

  private toIsoDate(date: Date | null): string | null {
    if (!date) return null;
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  buscar(): void {
    this.errorMessage = '';
    this.validationErrors = [];
    this.expandedGroup = null;

    if (this.dateFrom && this.dateTo && this.dateTo < this.dateFrom) {
      this.validationErrors = ['La fecha "Hasta" debe ser mayor o igual a la fecha "Desde".'];
      return;
    }

    const filtros: SneakerReportFilters = {
      dateFrom: this.toIsoDate(this.dateFrom),
      dateTo: this.toIsoDate(this.dateTo),
      branchId: this.branchId,
      brandId: this.brandId,
      customerId: this.customerId,
      ticketStatus: this.ticketStatus,
      pendingDelivery: this.pendingDelivery || null
    };

    this.loading = true;
    this.inspeccionService.obtenerReporteZapatillas(filtros).subscribe({
      next: (resp) => {
        this.loading = false;
        this.dataSource.data = resp.data;
      },
      error: (err) => {
        this.loading = false;
        this.dataSource.data = [];
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.errorMessage = extractErrorMessage(err, 'Ocurrió un error al obtener el reporte de zapatillas.');
        }
      }
    });
  }

  limpiar(): void {
    this.dateFrom = null;
    this.dateTo = null;
    this.branchId = null;
    this.brandId = null;
    this.customerId = null;
    this.clienteControl.setValue('');
    this.ticketStatus = null;
    this.pendingDelivery = true;
    this.errorMessage = '';
    this.validationErrors = [];
    this.dataSource.data = [];
    this.expandedGroup = null;
  }

  toggleFila(grupo: SneakerReportGroupResponse): void {
    const yaExpandida = this.expandedGroup?.workGuideId === grupo.workGuideId;
    this.expandedGroup = yaExpandida ? null : grupo;

    if (!yaExpandida && grupo.photoCount > 0 && !this.fotosPorGuia.has(grupo.workGuideId)) {
      this.cargarFotos(grupo.workGuideId);
    }
  }

  private cargarFotos(workGuideId: number): void {
    this.cargandoFotosGuiaId = workGuideId;
    this.inspeccionService.obtenerFotosPorGuia(workGuideId).subscribe({
      next: (resp) => {
        this.cargandoFotosGuiaId = null;
        const fotos = resp.data.photos;
        this.fotosPorGuia.set(workGuideId, fotos);
        const urls = new Map<number, string>();
        this.fotoUrlsPorGuia.set(workGuideId, urls);
        fotos.forEach((foto) => {
          this.inspeccionService.descargarFotoGuia(foto.id).subscribe({
            next: (blob) => urls.set(foto.id, URL.createObjectURL(blob)),
            error: () => { /* si falla una miniatura, simplemente no se muestra */ }
          });
        });
      },
      error: () => {
        this.cargandoFotosGuiaId = null;
      }
    });
  }

  abrirFoto(workGuideId: number, index: number): void {
    const fotos = this.fotosPorGuia.get(workGuideId) ?? [];
    const fotoUrls = this.fotoUrlsPorGuia.get(workGuideId) ?? new Map<number, string>();
    this.dialog.open(DialogVerFotosComponent, {
      width: '440px',
      maxWidth: '95vw',
      data: { fotos, fotoUrls, startIndex: index }
    });
  }
}
