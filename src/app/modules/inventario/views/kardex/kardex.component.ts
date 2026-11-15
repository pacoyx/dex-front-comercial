import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CustomDateAdapter } from '../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../core/configGlobal/custom-date-formats';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { InventarioService } from '../../services/inventario.service';
import { IKardex, InventoryMovementStatus, IProductOption, IWarehouse } from '../../interfaces/IInventario';
import { firstDayOfMonth, toIsoDate } from '../../shared/movement-type';
import { mensajeError } from '../../shared/http-error.util';
import { descargarArchivo } from '../../shared/file-download.util';
import { ProductPickerComponent } from '../../shared/product-picker/product-picker.component';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [
    FormsModule, RouterModule, MatButtonModule, MatCardModule, MatDatepickerModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatSelectModule, LoadingComponent, DatePipe, DecimalPipe, ProductPickerComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './kardex.component.html',
  styleUrls: ['../../shared/inventario-page.css', './kardex.component.css']
})
export class KardexComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private inventarioService = inject(InventarioService);
  private notifications = inject(NotificationsSystemService);

  readonly Cancelled = InventoryMovementStatus.Cancelled;

  almacenes: IWarehouse[] = [];
  producto: IProductOption | null = null;
  warehouseId: number | null = null;
  desde: Date = firstDayOfMonth();
  hasta: Date = new Date();

  kardex: IKardex | null = null;
  loading = false;
  exportando: 'excel' | 'pdf' | null = null;
  errorMessage = '';

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.queryParamMap.get('productId')) || null;
    const warehouseParam = Number(this.route.snapshot.queryParamMap.get('warehouseId')) || null;

    this.inventarioService.listarAlmacenes().subscribe({
      next: (resp) => {
        this.almacenes = resp.data;
        this.warehouseId = warehouseParam ?? resp.data.find(a => a.isDefault)?.id ?? resp.data[0]?.id ?? null;
        if (productId) {
          // Viene desde la consulta de stock: se muestra el kardex directamente.
          this.producto = { id: productId, name: '', unitMeasurementDescription: '' };
          this.buscar();
        }
      },
      error: (err) => this.errorMessage = mensajeError(err, 'No se pudieron cargar los almacenes.')
    });
  }

  buscar(): void {
    if (!this.producto || !this.warehouseId) {
      this.errorMessage = 'Seleccione el producto y el almacén.';
      return;
    }
    if (this.hasta < this.desde) {
      this.errorMessage = 'La fecha "Hasta" no puede ser anterior a "Desde".';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.inventarioService.obtenerKardex(this.producto.id, this.warehouseId, toIsoDate(this.desde)!, toIsoDate(this.hasta)!).subscribe({
      next: (resp) => {
        this.loading = false;
        this.kardex = resp.data;
        if (!this.producto?.name) {
          this.producto = { id: resp.data.productId, name: resp.data.productName, code: resp.data.productCode, unitMeasurementDescription: resp.data.unitName ?? '' };
        }
      },
      error: (err) => {
        this.loading = false;
        this.kardex = null;
        this.errorMessage = mensajeError(err, 'No se pudo obtener el kardex.');
      }
    });
  }

  exportar(formato: 'excel' | 'pdf'): void {
    if (!this.producto || !this.warehouseId) return;
    this.exportando = formato;
    this.inventarioService.descargarKardex(formato, this.producto.id, this.warehouseId, toIsoDate(this.desde)!, toIsoDate(this.hasta)!).subscribe({
      next: (resp) => {
        this.exportando = null;
        descargarArchivo(resp, `Kardex.${formato === 'excel' ? 'xlsx' : 'pdf'}`);
      },
      error: (err) => {
        this.exportando = null;
        this.notifications.showError(mensajeError(err, 'No se pudo exportar el kardex.'));
      }
    });
  }
}
