import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { DialogClienteTouchComponent } from '../../../recepcion/components/dialog-cliente-touch/dialog-cliente-touch.component';
import { VentasService } from '../../services/ventas.service';
import { IClienteSeleccionado, IPosContext, ISaleProduct, PAYMENT_OPTIONS, PaymentType } from '../../interfaces/IVentas';
import { mensajeError } from '../../shared/http-error.util';
import { imprimirTicket } from '../../shared/ticket-nota-venta';

interface LineaVenta {
  product: ISaleProduct;
  quantity: number;
  unitPrice: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [
    FormsModule, RouterModule, MatButtonModule, MatButtonToggleModule, MatCardModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatSelectModule, MatTooltipModule, LoadingComponent, DecimalPipe
  ],
  templateUrl: './pos.component.html',
  styleUrls: ['../../../inventario/shared/inventario-page.css', './pos.component.css']
})
export class PosComponent implements OnInit {

  private ventasService = inject(VentasService);
  private notifications = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  readonly pagos = PAYMENT_OPTIONS;

  contexto: IPosContext | null = null;
  cargandoContexto = true;
  errorContexto = '';

  warehouseId: number | null = null;

  // Búsqueda de productos
  busqueda = '';
  private busqueda$ = new Subject<string>();
  resultados: ISaleProduct[] = [];
  buscando = false;

  // Carrito
  lineas: LineaVenta[] = [];
  cliente: IClienteSeleccionado | null = null;
  paymentType: PaymentType = 'EF';
  paymentDescription = '';
  amountReceived: number | null = null;
  notes = '';

  cobrando = false;
  errores: string[] = [];

  ngOnInit(): void {
    this.busqueda$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(term => {
        this.buscando = true;
        return this.ventasService.buscarProductos(term, this.warehouseId).pipe(
          map(resp => resp.data),
          catchError(() => of([] as ISaleProduct[]))
        );
      })
    ).subscribe(productos => {
      this.buscando = false;
      this.resultados = productos;
    });

    this.cargarContexto();
  }

  cargarContexto(): void {
    this.cargandoContexto = true;
    this.errorContexto = '';
    this.ventasService.contextoPos().subscribe({
      next: (resp) => {
        this.cargandoContexto = false;
        this.contexto = resp.data;
        this.warehouseId = resp.data.defaultWarehouseId;
        if (resp.data.cashBoxOpen) this.refrescarBusqueda();
      },
      error: (err) => {
        this.cargandoContexto = false;
        this.errorContexto = mensajeError(err, 'No se pudo cargar el punto de venta.');
      }
    });
  }

  buscar(term: string): void {
    this.busqueda$.next(term.trim());
  }

  /** Vuelve a consultar con el texto actual (p. ej. tras cambiar de almacén o vender). */
  refrescarBusqueda(): void {
    this.buscando = true;
    this.ventasService.buscarProductos(this.busqueda.trim(), this.warehouseId).subscribe({
      next: (resp) => {
        this.buscando = false;
        this.resultados = resp.data;
        // Actualiza el stock de lo que ya está en el carrito.
        this.lineas.forEach(l => {
          const p = resp.data.find(r => r.id === l.product.id);
          if (p) l.product = { ...l.product, stock: p.stock };
        });
      },
      error: () => this.buscando = false
    });
  }

  cambiarAlmacen(): void {
    this.lineas = [];
    this.refrescarBusqueda();
  }

  // ---- Carrito ----

  agregar(product: ISaleProduct): void {
    const existente = this.lineas.find(l => l.product.id === product.id);
    if (existente) {
      existente.quantity += 1;
    } else {
      this.lineas = [...this.lineas, { product, quantity: 1, unitPrice: product.price }];
    }
    this.errores = [];
  }

  cambiarCantidad(linea: LineaVenta, delta: number): void {
    const nueva = Math.round((linea.quantity + delta) * 10000) / 10000;
    if (nueva <= 0) {
      this.quitar(linea);
    } else {
      linea.quantity = nueva;
    }
  }

  quitar(linea: LineaVenta): void {
    this.lineas = this.lineas.filter(l => l !== linea);
  }

  totalLinea(l: LineaVenta): number {
    return Math.round((l.quantity || 0) * (l.unitPrice || 0) * 100) / 100;
  }

  excedeStock(l: LineaVenta): boolean {
    return l.product.tracksStock && l.quantity > l.product.stock;
  }

  get total(): number {
    return Math.round(this.lineas.reduce((s, l) => s + this.totalLinea(l), 0) * 100) / 100;
  }

  get subtotal(): number {
    const rate = this.contexto?.igvRate ?? 0.18;
    return Math.round((this.total / (1 + rate)) * 100) / 100;
  }

  get igv(): number {
    return Math.round((this.total - this.subtotal) * 100) / 100;
  }

  get vuelto(): number {
    if (this.paymentType !== 'EF' || this.amountReceived === null) return 0;
    return Math.max(0, Math.round((this.amountReceived - this.total) * 100) / 100);
  }

  /** Montos rápidos para efectivo: exacto y billetes comunes por encima del total. */
  get montosRapidos(): number[] {
    const total = this.total;
    const billetes = [10, 20, 50, 100, 200].filter(b => b > total).slice(0, 3);
    return [total, ...billetes];
  }

  get nombreCliente(): string {
    return this.cliente ? `${this.cliente.nombres} ${this.cliente.apellidos}`.trim() : (this.contexto?.walkInCustomerName ?? 'CLIENTES VARIOS');
  }

  elegirCliente(): void {
    const ref = this.dialog.open(DialogClienteTouchComponent, { data: { filtro: '' }, maxWidth: '95vw' });
    ref.afterClosed().subscribe((cliente?: IClienteSeleccionado) => {
      if (cliente?.id) this.cliente = cliente;
    });
  }

  quitarCliente(): void {
    this.cliente = null;
  }

  // ---- Cobro ----

  private validar(): string[] {
    const errores: string[] = [];
    if (this.lineas.length === 0) errores.push('Agregue al menos un producto.');
    if (this.lineas.some(l => !l.quantity || l.quantity <= 0)) errores.push('Hay cantidades inválidas.');
    if (this.lineas.some(l => l.unitPrice === null || l.unitPrice < 0)) errores.push('Hay precios inválidos.');
    const sinStock = this.lineas.filter(l => this.excedeStock(l)).map(l => l.product.name);
    if (sinStock.length) errores.push(`Stock insuficiente: ${sinStock.join(', ')}.`);
    if (this.paymentType === 'EF' && this.amountReceived !== null && this.amountReceived < this.total) {
      errores.push('El monto recibido es menor al total.');
    }
    return errores;
  }

  cobrar(): void {
    this.errores = this.validar();
    if (this.errores.length > 0) return;

    this.cobrando = true;
    this.ventasService.registrarVenta({
      warehouseId: this.warehouseId,
      customerId: this.cliente?.id ?? null,
      paymentType: this.paymentType,
      paymentDescription: this.paymentDescription.trim() || null,
      amountReceived: this.paymentType === 'EF' ? (this.amountReceived ?? this.total) : this.total,
      notes: this.notes.trim() || null,
      lines: this.lineas.map(l => ({ productId: l.product.id, quantity: l.quantity, unitPrice: l.unitPrice }))
    }).subscribe({
      next: (resp) => {
        this.cobrando = false;
        const venta = resp.data;
        this.notifications.showSuccess(`${venta.number} registrada${venta.paymentType === 'EF' && venta.change > 0 ? ` · Vuelto S/ ${venta.change.toFixed(2)}` : ''}`);
        imprimirTicket(venta);
        this.nuevaVenta();
      },
      error: (err) => {
        this.cobrando = false;
        this.errores = [mensajeError(err, 'No se pudo registrar la venta.')];
        this.refrescarBusqueda();
      }
    });
  }

  nuevaVenta(): void {
    this.lineas = [];
    this.cliente = null;
    this.paymentType = 'EF';
    this.paymentDescription = '';
    this.amountReceived = null;
    this.notes = '';
    this.errores = [];
    this.refrescarBusqueda();
  }
}
