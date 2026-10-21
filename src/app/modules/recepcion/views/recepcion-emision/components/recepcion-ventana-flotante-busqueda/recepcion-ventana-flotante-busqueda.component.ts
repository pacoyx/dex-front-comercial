import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ICustomerGarmentHistory } from '../../../../interfaces/ICustomerGarmentHistory';
import { EmisionStoreService } from '../../../../services/emision.store.service';
import { EmisionService } from '../../../../services/emision.service';
import { NotificationServiceService } from '../../../../services/notification-service.service';
import { DialogQuestionComponent } from '../../../../components/dialog-question/dialog-question.component';

@Component({
  selector: 'app-recepcion-ventana-flotante-busqueda',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    DragDropModule,
    FormsModule,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './recepcion-ventana-flotante-busqueda.component.html',
  styleUrl: './recepcion-ventana-flotante-busqueda.component.css',
})
export class RecepcionVentanaFlotanteBusquedaComponent implements OnInit, OnDestroy {
  readonly dialogRef = inject(MatDialogRef<RecepcionVentanaFlotanteBusquedaComponent>);
  readonly dialog = inject(MatDialog);
  readonly store = inject(EmisionStoreService);
  readonly emisionService = inject(EmisionService);
  readonly notificacionService = inject(NotificationServiceService);
  readonly data = inject<{ customerId: number }>(MAT_DIALOG_DATA);

  searchText = '';
  loading = false;
  displayedColumns: string[] = ['name', 'price', 'usage', 'actions'];
  dataSource = new MatTableDataSource<ICustomerGarmentHistory>([]);

  private readonly searchInput = new Subject<string>();
  private searchSubscription?: Subscription;
  private cargaSubscription?: Subscription;
  private eliminarSubscription?: Subscription;

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.searchSubscription = this.searchInput
      .pipe(debounceTime(300))
      .subscribe((texto) => this.buscar(texto));
  }

  ngOnDestroy(): void {
    this.searchInput.complete();
    this.searchSubscription?.unsubscribe();
    this.cargaSubscription?.unsubscribe();
    this.eliminarSubscription?.unsubscribe();
  }

  cargarDatosIniciales(): void {
    this.buscar('');
  }

  onSearchChange(): void {
    this.searchInput.next(this.searchText);
  }

  limpiarFiltro(): void {
    this.searchText = '';
    this.buscar('');
  }

  private buscar(texto: string): void {
    this.loading = true;
    this.cargaSubscription = this.emisionService
      .listarHistorialPrendasCliente(this.data.customerId, texto.trim() || undefined)
      .subscribe({
        next: (resp) => {
          this.loading = false;
          this.dataSource.data = resp.data ?? [];
        },
        error: (err) => {
          this.loading = false;
          this.notificacionService.showError('No se pudo cargar el historial de prendas del cliente.');
          console.log(err);
        },
      });
  }

  eliminarDeLista(item: ICustomerGarmentHistory): void {
    this.dialog
      .open(DialogQuestionComponent, {
        width: '400px',
        data: {
          title: 'Eliminar prenda del historial',
          message: `¿Está seguro de eliminar "${item.productName}" del historial de este cliente?`,
          msgButton: 'Eliminar',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result !== 'OK') return;

        this.eliminarSubscription = this.emisionService.eliminarHistorialPrenda(item.id).subscribe({
          next: (resp) => {
            if (!resp.success) {
              this.notificacionService.showError(resp.message || 'No se pudo eliminar la prenda del historial.');
              return;
            }
            this.dataSource.data = this.dataSource.data.filter((r) => r.id !== item.id);
            this.notificacionService.showSuccess('Se eliminó la prenda del historial.');
          },
          error: (err) => {
            this.notificacionService.showError('No se pudo eliminar la prenda del historial.');
            console.log(err);
          },
        });
      });
  }

  agregarAlDetalle(item: ICustomerGarmentHistory): void {
    this.store.add({
      codProd: item.productId.toString(),
      nomProd: item.productName,
      Cant: 1,
      Precio: item.price,
      Subtotal: item.price,
      Obs: item.detail,
      Identificador: '',
    });
    this.notificacionService.showSuccess(`Se agregó "${item.productName}" al detalle.`);
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
