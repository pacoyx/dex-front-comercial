import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { EmisionService } from '../../../../services/emision.service';
import { LoginService } from '../../../../../../core/services/login.service';
import { Subscription } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ICashBoxDetailResponseDto } from '../../../../interfaces/ICajaVentas';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-caja-movimientos',
  standalone: true,
  imports: [MatTableModule, DecimalPipe, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './caja-movimientos.component.html',
  styleUrl: './caja-movimientos.component.css'
})
export class CajaMovimientosComponent implements OnInit, OnDestroy {

  emisionService = inject(EmisionService);
  loginSerivce = inject(LoginService);
  userId = 0;
  loading = false;
  subscriptionListaDetalles!: Subscription;

  displayedColumns: string[] = [
    'documento',
    'cliente',
    'tipoPago',
    'adelanto',
    'importe',
    'operaciones',
  ];
  dataSource = new MatTableDataSource<ICashBoxDetailResponseDto>([]);

  tiposPago = [
    { id: 'TO', tipo: '[Todos]' },
    { id: 'EF', tipo: 'Efectivo' },
    { id: 'QR', tipo: 'Yape' },
    { id: 'TA', tipo: 'Tarjeta' },
    { id: 'TR', tipo: 'Transferencia' },
    { id: 'CA', tipo: 'Cancelar' },
  ];

  constructor() { }

  ngOnInit(): void {
    this.userId = this.loginSerivce.getLoginData()?.userId!;
    this.cargarMovimientos();
  }

  ngOnDestroy(): void {
    if (this.subscriptionListaDetalles) {
      this.subscriptionListaDetalles.unsubscribe();
    }
  }

  cargarMovimientos(): void {
    this.loading = true;
    this.subscriptionListaDetalles = this.emisionService.ListarCajaDetallesPorUser(this.userId).subscribe({
      next: (response) => {
        this.loading = false;
        this.dataSource = new MatTableDataSource<ICashBoxDetailResponseDto>(response.data);
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      },
      complete: () => {
        console.log('complete ListarCajaDetallesPorUser()');
      }
    });
  }
  editItem(item: ICashBoxDetailResponseDto): void {
    console.log('editItem', item);
  }

  deleteItem(item: ICashBoxDetailResponseDto): void {
    console.log('deleteItem', item);
  }

  applyFilter(event: Event): void {

    const target = event.target as HTMLInputElement;
    const filterValue = target.value.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: ICashBoxDetailResponseDto, filter: string) => {
      return data.customer.firtsName.toLowerCase().includes(filter); // Change 'cliente' to the specific field you want to filter by
    };
    this.dataSource.filter = filterValue;


    // const filterValue = (event.target as HTMLInputElement).value;
    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addItem(): void {
    console.log('addItem');
  }

  applyTipoPagoFilter(event: string): void {
    console.log('evnto====>', event);

    if (event === 'TO') {
      this.dataSource.filter = '';
      return;
    }


    const filterValue = event.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: ICashBoxDetailResponseDto, filter: string) => {
      return data.tipoPago.toLowerCase().includes(filter); // Change 'cliente' to the specific field you want to filter by
    };
    this.dataSource.filter = filterValue;

  }
}
