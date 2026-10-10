import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { DialogQuestionComponent } from '../../../../../recepcion/components/dialog-question/dialog-question.component';
import { CatalogosService } from '../../../../services/catalogos.service';
import { PriceListsService } from '../../../../services/price-lists.service';
import { ICustomerPriceList, ICustomerPriceListSummary } from '../../../../interfaces/IPriceList';
import { IProdServiceCatalogItem } from '../../../../interfaces/ICatalogos';
import { extractErrorMessage } from '../../../../shared/http-error.util';
import { DialogFormTarifaComponent } from '../dialog-form-tarifa/dialog-form-tarifa.component';
import { DialogClonarTarifaComponent } from '../dialog-clonar-tarifa/dialog-clonar-tarifa.component';
import { DialogVerTarifaComponent } from '../dialog-ver-tarifa/dialog-ver-tarifa.component';

@Component({
  selector: 'app-gestion-tarifas',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatTableModule, MatTooltipModule, DatePipe, LoadingComponent],
  templateUrl: './gestion-tarifas.component.html',
  styleUrl: './gestion-tarifas.component.css'
})
export class GestionTarifasComponent implements OnInit, OnChanges {

  @Input({ required: true }) customerId!: number;

  private priceListsService = inject(PriceListsService);
  private catalogosService = inject(CatalogosService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  tarifas: ICustomerPriceListSummary[] = [];
  loading = false;
  displayedColumns: string[] = ['name', 'version', 'vigencia', 'estado', 'acciones'];

  ngOnInit(): void {
    this.cargarTarifas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerId'] && !changes['customerId'].firstChange) {
      this.cargarTarifas();
    }
  }

  cargarTarifas(): void {
    if (!this.customerId) return;
    this.loading = true;
    this.priceListsService.listarPorCliente(this.customerId).subscribe({
      next: (resp) => {
        this.tarifas = resp.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron obtener las tarifas del cliente.'));
      },
    });
  }

  private obtenerCatalogoServicios(): Promise<IProdServiceCatalogItem[]> {
    return new Promise((resolve) => {
      this.catalogosService.listarCatalogoServicios().subscribe({
        next: (resp) => resolve(resp.data?.servicios ?? []),
        error: (err) => {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo obtener el catálogo de servicios.'));
          resolve([]);
        },
      });
    });
  }

  async nuevaTarifa(): Promise<void> {
    const servicios = await this.obtenerCatalogoServicios();
    const dialogRef = this.dialog.open(DialogFormTarifaComponent, {
      width: '720px',
      maxWidth: '95vw',
      data: { esNuevo: true, customerId: this.customerId, tarifa: null, servicios },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.cargarTarifas();
    });
  }

  verDetalle(tarifa: ICustomerPriceListSummary): void {
    this.priceListsService.obtenerPorId(tarifa.id).subscribe({
      next: (resp) => {
        this.dialog.open(DialogVerTarifaComponent, {
          width: '600px',
          data: { tarifa: resp.data },
        });
      },
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudo obtener el detalle de la tarifa.')),
    });
  }

  clonar(tarifa: ICustomerPriceListSummary): void {
    const dialogRef = this.dialog.open(DialogClonarTarifaComponent, {
      width: '480px',
      data: { priceListId: tarifa.id, nombreActual: tarifa.name },
    });

    dialogRef.afterClosed().subscribe(async (clonada: ICustomerPriceList | null) => {
      if (!clonada) return;
      this.cargarTarifas();

      const servicios = await this.obtenerCatalogoServicios();
      const editRef = this.dialog.open(DialogFormTarifaComponent, {
        width: '720px',
        maxWidth: '95vw',
        data: { esNuevo: false, customerId: this.customerId, tarifa: clonada, servicios },
      });
      editRef.afterClosed().subscribe(result => {
        if (result) this.cargarTarifas();
      });
    });
  }

  activar(tarifa: ICustomerPriceListSummary): void {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: {
        title: 'Activar Tarifa',
        message: `¿Está seguro de activar la tarifa "${tarifa.name}"? Esta pasará a ser la tarifa vigente para el cliente.`,
        msgButton: 'Activar',
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'OK') {
        this.priceListsService.activar(tarifa.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Tarifa activada correctamente.');
            this.cargarTarifas();
          },
          error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudo activar la tarifa.')),
        });
      }
    });
  }

  desactivar(tarifa: ICustomerPriceListSummary): void {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: {
        title: 'Desactivar Tarifa',
        message: `¿Está seguro de desactivar la tarifa "${tarifa.name}"?`,
        msgButton: 'Desactivar',
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'OK') {
        this.priceListsService.desactivar(tarifa.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Tarifa desactivada correctamente.');
            this.cargarTarifas();
          },
          error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudo desactivar la tarifa.')),
        });
      }
    });
  }

}
