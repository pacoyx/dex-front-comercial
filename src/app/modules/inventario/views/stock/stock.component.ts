import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { InventarioService } from '../../services/inventario.service';
import { IStockItem, IWarehouse } from '../../interfaces/IInventario';
import { mensajeError } from '../../shared/http-error.util';

@Component({
  selector: 'app-inventario-stock',
  standalone: true,
  imports: [
    FormsModule, RouterModule, MatButtonModule, MatCardModule, MatCheckboxModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatSelectModule, MatTableModule, MatTooltipModule, LoadingComponent, CurrencyPipe, DecimalPipe
  ],
  templateUrl: './stock.component.html',
  styleUrl: '../../shared/inventario-page.css'
})
export class StockComponent implements OnInit {

  private inventarioService = inject(InventarioService);
  private router = inject(Router);

  almacenes: IWarehouse[] = [];
  warehouseId: number | null = null;
  search = '';
  soloBajoMinimo = false;

  items: IStockItem[] = [];
  columnas = ['code', 'product', 'category', 'quantity', 'averageCost', 'totalValue', 'status'];
  loading = false;
  errorMessage = '';

  get valorTotal(): number {
    return this.items.reduce((sum, i) => sum + i.totalValue, 0);
  }

  get cantidadBajoMinimo(): number {
    return this.items.filter(i => i.belowMin).length;
  }

  ngOnInit(): void {
    this.inventarioService.listarAlmacenes(true).subscribe({
      next: (resp) => {
        this.almacenes = resp.data;
        this.buscar();
      },
      error: (err) => this.errorMessage = mensajeError(err, 'No se pudieron cargar los almacenes.')
    });
  }

  buscar(): void {
    this.loading = true;
    this.errorMessage = '';
    this.inventarioService.consultarStock(this.warehouseId, this.soloBajoMinimo, this.search.trim() || null).subscribe({
      next: (resp) => {
        this.loading = false;
        this.items = resp.data;
      },
      error: (err) => {
        this.loading = false;
        this.items = [];
        this.errorMessage = mensajeError(err, 'No se pudo consultar el stock.');
      }
    });
  }

  limpiar(): void {
    this.warehouseId = null;
    this.search = '';
    this.soloBajoMinimo = false;
    this.buscar();
  }

  verKardex(item: IStockItem): void {
    const warehouseId = this.warehouseId ?? this.almacenes.find(a => a.isDefault)?.id ?? this.almacenes[0]?.id;
    this.router.navigate(['/inventario/kardex'], { queryParams: { productId: item.productId, warehouseId } });
  }
}
