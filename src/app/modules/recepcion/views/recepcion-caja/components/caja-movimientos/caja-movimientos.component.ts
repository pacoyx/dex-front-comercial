import { AfterViewInit, Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { EmisionService } from '../../../../services/emision.service';
import { Subscription } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ICashBoxDetailResponseDto } from '../../../../interfaces/ICajaVentas';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { DialogFormRegMovimientoComponent } from './components/dialog-form-reg-movimiento/dialog-form-reg-movimiento.component';
import { DialogQuestionComponent } from '../../../../components/dialog-question/dialog-question.component';

@Component({
  selector: 'app-caja-movimientos',
  standalone: true,
  imports: [
    MatTableModule, DecimalPipe, MatIconModule, 
    MatButtonModule, MatFormFieldModule, MatInputModule, 
    MatSelectModule],
  templateUrl: './caja-movimientos.component.html',
  styleUrl: './caja-movimientos.component.css'
})
export class CajaMovimientosComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  @Output() cargarData = new EventEmitter<boolean>();
  @Input() userIdData: number = 0;
  @Input() movimientosData: ICashBoxDetailResponseDto[] = [];


  emisionService = inject(EmisionService);
  readonly dialog = inject(MatDialog);

  userId = 0;
  loading = false;
  subscriptionListaDetalles!: Subscription;
  filterSubscription!: Subscription;

  displayedColumns: string[] = [
    'documento',
    'cliente',
    'tipoPago',
    'adelanto',
    'importe',
    'operaciones',
  ];
  dataSource = new MatTableDataSource<ICashBoxDetailResponseDto>([]);
  listsItems: ICashBoxDetailResponseDto[] = [];
  selectedTP='';

  tiposPago = [
    { id: 'TO', tipo: '[Todos]' },
    { id: 'EF', tipo: 'Efectivo' },
    { id: 'QR', tipo: 'Yape' },
    { id: 'TA', tipo: 'Tarjeta' },
    { id: 'TR', tipo: 'Transferencia' },
  ];

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.subscriptionListaDetalles) {
      this.subscriptionListaDetalles.unsubscribe();
    }
  }

  ngAfterViewInit(): void {

    // Suscribirse a los cambios en el filtro
    this.filterSubscription = this.dataSource.connect().subscribe(() => {
      this.getTotalAdelanto();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userIdData'] && changes['userIdData'].currentValue) {
      this.userId = this.userIdData;
    }
    if (changes['movimientosData'] && changes['movimientosData'].currentValue) {
      this.dataSource = new MatTableDataSource<ICashBoxDetailResponseDto>(this.movimientosData);
      this.listsItems = this.movimientosData;
    }
  }

  cargarMovimientos(): void {
    this.loading = true;
    this.subscriptionListaDetalles = this.emisionService.ListarCajaDetallesPorUser(this.userId).subscribe({
      next: (response) => {
        this.loading = false;
        this.dataSource = new MatTableDataSource<ICashBoxDetailResponseDto>(response.data);
        this.listsItems = response.data;
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

  getTotalAdelanto() {
    // return this.listsItems.map(t => t.adelanto).reduce((acc, value) => acc + value, 0);
    const filteredData = this.dataSource.filteredData;
    return filteredData.reduce((acc, item) => acc + item.adelanto, 0);
  }

  getTotalImporte() {
    // return this.listsItems.map(t => t.importe).reduce((acc, value) => acc + value, 0);
    const filteredData = this.dataSource.filteredData;
    return filteredData.reduce((acc, item) => acc + item.importe, 0);
  }

  editItem(item: ICashBoxDetailResponseDto): void {
    console.log('editItem', item);
  }

  deleteItem(item: ICashBoxDetailResponseDto): void {
    console.log('deleteItem', item);


    var dialogResponse = this.dialog.open(DialogQuestionComponent, {
      width: '600px',
      data: {
        title: 'Eliminar movimiento',
        message: '¿Está seguro de eliminar el movimiento seleccionado?',
        msgButton: 'Eliminar'
      }
    });

    dialogResponse.afterClosed().subscribe({
      next: (result) => {
        console.log('dialogResponse.afterClosed()', result);
        if (result == 'OK') {
          this.emisionService.EliminarItemCajaDetalle(item.id).subscribe({
            next: (response) => {
              console.log(response);
              if (response.success) {
                this.cargarData.emit(true);
              }
            },
            error: (err) => {
              console.log(err);
            },
            complete: () => {
              console.log('complete EliminarCajaDetalle()');
            }
          });
        }
      }
    });


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
    var dialogResponse = this.dialog.open(DialogFormRegMovimientoComponent, {
      width: '600px',
      data: {
        userId: this.userId,
      }
    });
    dialogResponse.afterClosed().subscribe({
      next: (result) => {
        console.log('dialogResponse.afterClosed()', result);
        if (result) {
          this.cargarData.emit(true);
        }
      }
    });
  }

  applyTipoPagoFilter(event: string): void {
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
  quitarFiltros(): void {
    this.dataSource.filter = '';    
    this.selectedTP = 'TO';
  }


}
