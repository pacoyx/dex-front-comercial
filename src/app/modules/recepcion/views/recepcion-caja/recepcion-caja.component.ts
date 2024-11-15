import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { CajaAperturaComponent } from './components/caja-apertura/caja-apertura.component';
import { CajaMovimientosComponent } from './components/caja-movimientos/caja-movimientos.component';
import { CajaCierreComponent } from './components/caja-cierre/caja-cierre.component';
import { Subscription } from 'rxjs';
import { EmisionService } from '../../services/emision.service';
import { LoginService } from '../../../../core/services/login.service';
import { ICashBoxDetailResponseDto, IListarCajaPorUsuarioResponse, ITotalizadoPorTipoPago } from '../../interfaces/ICajaVentas';
import { ILoginResponseData } from '../../../../core/interfaces/ILoginResponse';
import { IListaGastosPorUserResponse } from '../../interfaces/IGastos';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationServiceService } from '../../services/notification-service.service';

@Component({
  selector: 'app-recepcion-caja',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTabsModule,
    CajaAperturaComponent, CajaMovimientosComponent, CajaCierreComponent
  ],
  templateUrl: './recepcion-caja.component.html',
  styleUrl: './recepcion-caja.component.css'
})
export class RecepcionCajaComponent implements OnInit, OnDestroy {

  emisionService = inject(EmisionService);
  loginService = inject(LoginService);
  notificacionService = inject(NotificationServiceService);

  loading = false;
  loadingCarga = false;
  indexTabLocal = 0;
  subscriptionConsulta!: Subscription;
  subscriptionListaDetalles!: Subscription;
  subscriptionListaGastos!: Subscription;

  cajaTmp: IListarCajaPorUsuarioResponse = null!;
  loginTmp: ILoginResponseData = null!;

  listsItemsTmp: ICashBoxDetailResponseDto[] = [];
  totalizadoData: ITotalizadoPorTipoPago[] = [];
  listGastosTmp: IListaGastosPorUserResponse[] = [];

  ngOnInit(): void {
    this.loginTmp = this.loginService.getLoginData()!;
    this.obtenerCajaPorUsuario();
    this.cargarMovimientos(true);
    this.cargarGastos();
  }

  ngOnDestroy(): void {
    if (this.subscriptionConsulta) {
      this.subscriptionConsulta.unsubscribe();
    }
    if (this.subscriptionListaDetalles) {
      this.subscriptionListaDetalles.unsubscribe();
    }
    if (this.subscriptionListaGastos) {
      this.subscriptionListaGastos.unsubscribe();
    }
  }

  obtenerCajaPorUsuario(): void {
    this.loadingCarga = true;
    this.subscriptionConsulta = this.emisionService.ListarCajaPorIdUser(this.loginTmp.userId!).subscribe({
      next: (data) => {
        this.loadingCarga = false;
        if (data.success) {
          if (data.data) {
            this.indexTabLocal = 1;
            this.cajaTmp = data.data;
          } else {
            this.indexTabLocal = 0;
          }
        }
      },
      error: (err) => {      
        this.notificacionService.showError(err);        
        this.loadingCarga = false;
      },
      complete: () => {
        console.log('complete obtenerCajaPorUsuario()');
      }
    });
  }

  cargarMovimientos(ref: boolean): void {
    this.loading = true;
    this.subscriptionListaDetalles = this.emisionService.ListarCajaDetallesPorUser(this.loginTmp.userId!).subscribe({
      next: (response) => {
        this.loading = false;
        this.listsItemsTmp = response.data;

        let resultado = this.listsItemsTmp
          .reduce((acc, item) => {
            const key = item.tipoPago;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(item);
            return acc;
          }, {} as { [key: string]: ICashBoxDetailResponseDto[] });
        let totalizado = Object.keys(resultado).map(key => {
          return {
            tipoPago: key,
            totalImporte: resultado[key].reduce((sum, item) => sum + item.importe, 0),
            totalAdelanto: resultado[key].reduce((sum, item) => sum + item.adelanto, 0),
            total: resultado[key].reduce((sum, item) => sum + item.importe + item.adelanto, 0)
          };
        });

        this.totalizadoData = totalizado;

      },
      error: (err) => {        
        this.notificacionService.showError(err.message);        
        this.loading = false;
      },
      complete: () => {
        console.log('complete ListarCajaDetallesPorUser()');
      }
    });
  }

  cargarGastos(): void {
    this.subscriptionListaGastos = this.emisionService.ListarGastosPorIdUser(this.loginTmp.userId!).subscribe({
      next: (res) => {
        if (res.success) {
          this.listGastosTmp = res.data;
        }
      },
      error: (err) => {
        console.log('error ListarGastosPorIdUser()', err);
        this.notificacionService.showError(err);        
      },
      complete: () => {
        console.log('complete ListarGastosPorIdUser()');
      }
    });
  }
}
