import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import { EmisionService } from '../../services/emision.service';
import { ReportesEmisionService } from '../../services/reportes-emision.service';
import { IClienteBusqueda } from '../dialog-cliente/dialog-cliente.component';
import { IReportGuiasDetalleResponse } from '../../interfaces/IReports';
import { FotoQueueComponent } from '../foto-queue/foto-queue.component';

interface GuiaSeleccionable {
  id: number;
  serieGuia: string;
  numeroGuia: string;
  customerName: string;
  fecha: string;
}

const SERIE_GUIA_DEFAULT = '001';

@Component({
  selector: 'app-dialog-adjuntar-foto-guia',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatProgressSpinnerModule, MatDialogTitle, MatDialogContent,
    MatDialogActions, FotoQueueComponent
  ],
  templateUrl: './dialog-adjuntar-foto-guia.component.html',
  styleUrl: './dialog-adjuntar-foto-guia.component.css'
})
export class DialogAdjuntarFotoGuiaComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly dialogRef = inject(MatDialogRef<DialogAdjuntarFotoGuiaComponent>);
  private readonly data = inject<{ archivosIniciales?: File[] } | null>(MAT_DIALOG_DATA, { optional: true });
  private emisionService = inject(EmisionService);
  private reportesEmisionService = inject(ReportesEmisionService);

  @ViewChild(FotoQueueComponent) fotoQueue!: FotoQueueComponent;

  guiaSeleccionada: GuiaSeleccionable | null = null;

  filtroTexto = '';
  buscando = false;
  clientesEncontrados: IClienteBusqueda[] = [];
  clienteSeleccionado: IClienteBusqueda | null = null;
  guiasDelCliente: IReportGuiasDetalleResponse[] = [];
  guiaDirectaEncontrada: GuiaSeleccionable | null = null;
  mensajeBusqueda = '';

  private busquedaInput = new Subject<string>();
  private subscripcionBusqueda!: Subscription;
  private subscripcionGuiasCliente?: Subscription;

  ngOnInit(): void {
    this.subscripcionBusqueda = this.busquedaInput.pipe(
      debounceTime(300),
      switchMap((valor) => {
        const texto = valor.trim();
        if (texto.length < 2) {
          this.buscando = false;
          return of(null);
        }

        if (/^\d+$/.test(texto)) {
          return this.emisionService.ObtenerGuiaPorDocumento(SERIE_GUIA_DEFAULT, texto).pipe(
            catchError(() => of(null))
          );
        }

        return this.emisionService.filtrarClientesPorPatron(texto).pipe(
          catchError(() => of(null))
        );
      })
    ).subscribe((resp: any) => {
      this.buscando = false;
      this.clientesEncontrados = [];
      this.guiaDirectaEncontrada = null;
      this.mensajeBusqueda = '';

      if (!resp || !resp.data) {
        this.mensajeBusqueda = 'No se encontraron resultados.';
        return;
      }

      if (Array.isArray(resp.data)) {
        this.clientesEncontrados = resp.data;
        if (this.clientesEncontrados.length === 0) {
          this.mensajeBusqueda = 'No se encontraron clientes con ese nombre.';
        }
      } else {
        const guia = resp.data;
        this.guiaDirectaEncontrada = {
          id: guia.id,
          serieGuia: guia.serieGuia,
          numeroGuia: guia.numeroGuia,
          customerName: guia.customerName,
          fecha: guia.fechaOperacion
        };
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.data?.archivosIniciales?.length) {
      this.fotoQueue.agregarArchivos(this.data.archivosIniciales);
    }
  }

  ngOnDestroy(): void {
    this.subscripcionBusqueda?.unsubscribe();
    this.subscripcionGuiasCliente?.unsubscribe();
  }

  onInputBusqueda(valor: string): void {
    this.filtroTexto = valor;
    this.clienteSeleccionado = null;
    this.guiasDelCliente = [];
    this.guiaDirectaEncontrada = null;
    this.mensajeBusqueda = '';

    if (valor.trim().length < 2) {
      this.clientesEncontrados = [];
      this.buscando = false;
      return;
    }

    this.buscando = true;
    this.busquedaInput.next(valor);
  }

  seleccionarCliente(cliente: IClienteBusqueda): void {
    this.clienteSeleccionado = cliente;
    this.clientesEncontrados = [];
    this.buscando = true;
    this.mensajeBusqueda = '';

    this.subscripcionGuiasCliente = this.reportesEmisionService.obtenerGuiasPorCliente(cliente.id, 1, 20).subscribe({
      next: (resp) => {
        this.buscando = false;
        const guias = resp.data?.guias ?? [];
        this.guiasDelCliente = guias.filter(g => g.estadoSituacion === 'P' && g.estadoRegistro !== 'I');
        if (this.guiasDelCliente.length === 0) {
          this.mensajeBusqueda = 'Este cliente no tiene guías pendientes de recojer.';
        }
      },
      error: () => {
        this.buscando = false;
        this.mensajeBusqueda = 'No se pudieron obtener las guías del cliente.';
      }
    });
  }

  volverABuscarClientes(): void {
    this.clienteSeleccionado = null;
    this.guiasDelCliente = [];
    this.mensajeBusqueda = '';
  }

  seleccionarGuiaDeCliente(guia: IReportGuiasDetalleResponse): void {
    this.confirmarGuia({
      id: guia.id,
      serieGuia: guia.serieGuia,
      numeroGuia: guia.numeroGuia,
      customerName: guia.nombreCliente,
      fecha: guia.fechaOperacion
    });
  }

  seleccionarGuiaDirecta(): void {
    if (this.guiaDirectaEncontrada) {
      this.confirmarGuia(this.guiaDirectaEncontrada);
    }
  }

  private confirmarGuia(guia: GuiaSeleccionable): void {
    this.guiaSeleccionada = guia;
    this.filtroTexto = '';
    this.clientesEncontrados = [];
    this.clienteSeleccionado = null;
    this.guiasDelCliente = [];
    this.guiaDirectaEncontrada = null;
    this.mensajeBusqueda = '';
  }

  cambiarGuia(): void {
    if (!this.fotoQueue || this.fotoQueue.pendientes === 0) {
      this.finalizarCambioGuia();
      return;
    }
    this.fotoQueue.subirTodo(() => this.finalizarCambioGuia());
  }

  private finalizarCambioGuia(): void {
    this.fotoQueue?.limpiar();
    this.guiaSeleccionada = null;
  }

  cerrar(): void {
    this.dialogRef.close({ subidas: this.fotoQueue?.subidas ?? 0 });
  }
}
