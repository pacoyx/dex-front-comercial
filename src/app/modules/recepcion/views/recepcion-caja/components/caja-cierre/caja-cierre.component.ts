import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ICerrarCajaRequest, IListarCajaPorUsuarioResponse, ITotalizadoPorTipoPago } from '../../../../interfaces/ICajaVentas';
import { ILoginResponseData } from '../../../../../../core/interfaces/ILoginResponse';
import { DatePipe, DecimalPipe } from '@angular/common';
import { IListaGastosPorUserResponse } from '../../../../interfaces/IGastos';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EmisionService } from '../../../../services/emision.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';

@Component({
  selector: 'app-caja-cierre',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, DatePipe, DecimalPipe,
    MatFormFieldModule, MatInputModule, FormsModule, LoadingComponent
  ],
  templateUrl: './caja-cierre.component.html',
  styleUrl: './caja-cierre.component.css'
})
export class CajaCierreComponent implements OnInit, OnDestroy, OnChanges {
  @Input() dataCaja!: IListarCajaPorUsuarioResponse;
  @Input() dataLogin!: ILoginResponseData;
  @Input() dataTotalizado!: ITotalizadoPorTipoPago[];
  @Input() dataGastos!: IListaGastosPorUserResponse[];

  emisionService = inject(EmisionService);

  cajaId = 0;
  saldoInicial = 0;
  totalEF = 0;
  totalTA = 0;
  totalQR = 0;
  totalIng = 0;
  totalSal = 0;
  totalFinal = 0;
  obserCierre = '';

  loading = false;
  loadingInfo = true;
  subscriptionCierre!: Subscription;

  constructor() { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    if (this.subscriptionCierre) {
      this.subscriptionCierre.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataCaja'] && changes['dataCaja'].currentValue) {
      this.loadingInfo = false;
      this.saldoInicial = this.dataCaja.saldoInicial;
      this.cajaId = this.dataCaja.id;
    }

    if (changes['dataTotalizado'] && changes['dataTotalizado'].currentValue) {
      this.totalEF = this.dataTotalizado.find(item => item.tipoPago === 'EF')?.total || 0;
      this.totalTA = this.dataTotalizado.find(item => item.tipoPago === 'TA')?.total || 0;
      this.totalQR = this.dataTotalizado.find(item => item.tipoPago === 'QR')?.total || 0;
      this.totalIng = this.totalEF + this.totalTA + this.totalQR;

    }

    if (changes['dataGastos'] && changes['dataGastos'].currentValue) {
      this.totalSal = this.dataGastos.reduce((acc, item) => acc + item.importe, 0);
      this.totalFinal = this.saldoInicial + this.totalIng - this.totalSal;
    }
  }


  cerrarCaja() {

    let requestCierre: ICerrarCajaRequest = {
      id: this.cajaId,
      estadoCaja: 'C',
      saldoFinal: this.totalFinal,
      totalIngreso: this.totalIng,
      totalSalida: this.totalSal,
      observacionesCierre: this.obserCierre,
    }

    this.loading = true;
    this.subscriptionCierre = this.emisionService.CerrarCaja(requestCierre).subscribe({
      next: (data) => {
        console.log(data);
        this.loading = false;
        if (data.success) {
          console.log('Caja cerrada correctamente');
          this.dataCaja.estadoCaja = 'C';
          this.dataCaja.fechaHoraCierre = new Date().toDateString();
        }
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
      }
    });
  }
}
