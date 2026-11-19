import { AfterViewInit, Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DecimalPipe } from '@angular/common';
import {
  catchError, debounceTime, distinctUntilChanged, EMPTY, map, merge, Observable, of, skip,
  startWith, Subject, Subscription, switchMap
} from 'rxjs';
import { MaestrosService } from '../../../services/maestros.service';
import { NotificationServiceService } from '../../../services/notification-service.service';
import { IResponseProdServices } from '../../../interfaces/IProdServices';
import { DialogFormRegProdServiceComponent } from './components/dialog-form-reg-prod-service/dialog-form-reg-prod-service.component';
import { DialogQuestionComponent } from '../../../components/dialog-question/dialog-question.component';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { extractErrorMessage } from '../../../shared/http-error.util';

/** Filas de la primera petición del catálogo completo (el paginado del backend no acepta filtro). */
const FILAS_CATALOGO_COMPLETO = 1000;

/** Acción que entra al flujo de búsqueda: un término nuevo o un refresco del término vigente. */
interface IAccionBusqueda {
  termino: string;
  refresco: boolean;
}

@Component({
  selector: 'app-mnt-prodservices',
  standalone: true,
  imports: [MatIconModule, MatTableModule, MatInputModule, MatFormFieldModule,
    MatPaginatorModule, MatSortModule, MatButtonModule, DecimalPipe,
    ReactiveFormsModule, LoadingComponent],
  templateUrl: './mnt-prodservices.component.html',
  styleUrl: './mnt-prodservices.component.css'
})
export class MntProdservicesComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dialog = inject(MatDialog);
  maestroSerivce = inject(MaestrosService);
  private notificationService = inject(NotificationServiceService);
  private destroyRef = inject(DestroyRef);

  displayedColumns: string[] = [
    'name',
    'price',
    'isPeso',
    'isLavado',
    'status',
    'operaciones'
  ];
  dataSource = new MatTableDataSource<IResponseProdServices>([]);
  totalClientes = 0;
  pageSize = 10;

  /** Texto del buscador (con debounce se aplica a `termino`). */
  readonly buscadorControl = new FormControl('', { nonNullable: true });
  /** Término de búsqueda aplicado. Vacío = modo paginación en servidor. */
  termino = '';
  /** true solo mientras está en curso la petición vigente del catálogo. */
  buscando = false;
  /** true si falló la búsqueda y no hay resultados válidos que mostrar. */
  errorBusqueda = false;

  /** Catálogo completo cacheado mientras dure la búsqueda; se invalida al crear/editar/eliminar o al limpiar. */
  private catalogoCache: IResponseProdServices[] | null = null;
  /** Coincidencias del término actual, ya ordenadas (modo búsqueda, paginadas en cliente). */
  private coincidencias: IResponseProdServices[] = [];
  /** Refrescos del catálogo en modo búsqueda; comparten el switchMap con el buscador. */
  private readonly recargaBusqueda$ = new Subject<void>();

  private cargaServidorSub?: Subscription;
  /** Última página (0-based) cargada con éxito en modo servidor. */
  private paginaServidorConfirmada = 0;

  get busquedaActiva(): boolean {
    return this.termino !== '';
  }

  ngOnInit(): void {
    this.cargarServicios(1, this.pageSize);
    this.configurarBuscador();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;

    this.paginator.page
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.pageSize = this.paginator.pageSize;
        if (this.buscando) {
          return;
        }
        if (this.busquedaActiva) {
          this.mostrarPaginaCliente();
        } else {
          this.cargarServicios(this.paginator.pageIndex + 1, this.paginator.pageSize);
        }
      });

    // En búsqueda se ordena el conjunto completo de coincidencias; en modo servidor basta
    // con el sort de la página visible que ya hace MatTableDataSource.
    this.sort.sortChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.busquedaActiva && this.catalogoCache) {
          this.aplicarFiltro(true);
        }
      });
  }

  // ===== Modo servidor =====

  cargarServicios(pagina: number, pageSize: number) {
    this.cargaServidorSub?.unsubscribe();
    this.cargaServidorSub = this.maestroSerivce.obtenerProdServices(pagina, pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (this.busquedaActiva) {
            return; // El usuario pasó a modo búsqueda mientras llegaba la respuesta.
          }
          const servicios = response.data?.servicios ?? [];
          const total = response.data?.totalCount ?? 0;
          const pageIndex = pagina - 1;

          // P. ej. se eliminó el único registro de la última página: ir a la última página válida.
          if (servicios.length === 0 && total > 0 && pageIndex > 0) {
            const ultima = Math.max(0, Math.ceil(total / pageSize) - 1);
            if (ultima < pageIndex) {
              this.paginator.length = total;
              this.paginator.pageIndex = ultima;
              this.cargarServicios(ultima + 1, pageSize);
              return;
            }
          }

          this.dataSource.data = servicios;
          this.totalClientes = total;
          this.paginator.length = total;
          this.paginaServidorConfirmada = pageIndex;
        },
        error: (err) => {
          if (!this.busquedaActiva) {
            this.paginator.pageIndex = this.paginaServidorConfirmada;
          }
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el listado de servicios.'));
        }
      });
  }

  // ===== Modo búsqueda (cliente) =====

  private configurarBuscador(): void {
    const terminos$ = this.buscadorControl.valueChanges.pipe(
      map((texto) => (texto ?? '').trim()),
      debounceTime(300),
      startWith(''),
      distinctUntilChanged(),
      skip(1), // La emisión inicial '' solo sirve de referencia para distinctUntilChanged.
      map((termino): IAccionBusqueda => ({ termino, refresco: false }))
    );

    const refrescos$ = this.recargaBusqueda$.pipe(
      map((): IAccionBusqueda => ({ termino: this.termino, refresco: true }))
    );

    merge(terminos$, refrescos$)
      .pipe(
        switchMap((accion) => this.procesarAccionBusqueda(accion)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  private procesarAccionBusqueda({ termino, refresco }: IAccionBusqueda): Observable<unknown> {
    if (!termino) {
      // Volver a modo servidor desde la página 1.
      this.termino = '';
      this.buscando = false;
      this.errorBusqueda = false;
      this.catalogoCache = null;
      this.coincidencias = [];
      this.paginator.pageIndex = 0;
      this.cargarServicios(1, this.paginator.pageSize);
      return EMPTY;
    }

    this.termino = termino;
    this.cargaServidorSub?.unsubscribe();

    if (!refresco && this.catalogoCache) {
      this.buscando = false;
      this.errorBusqueda = false;
      this.aplicarFiltro(true);
      return EMPTY;
    }

    const cacheAnterior = this.catalogoCache;
    this.catalogoCache = null;
    this.buscando = true;

    return this.obtenerCatalogoCompleto().pipe(
      map((servicios) => {
        this.buscando = false;
        this.errorBusqueda = false;
        this.catalogoCache = servicios;
        this.aplicarFiltro(!refresco);
      }),
      catchError((err) => {
        this.buscando = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo buscar en el listado de servicios.'));
        if (refresco && cacheAnterior) {
          // Se conservan los últimos resultados válidos.
          this.catalogoCache = cacheAnterior;
          this.aplicarFiltro(false);
        } else {
          this.errorBusqueda = true;
          this.coincidencias = [];
          this.totalClientes = 0;
          this.paginator.length = 0;
          this.paginator.pageIndex = 0;
          this.dataSource.data = [];
        }
        return EMPTY;
      })
    );
  }

  /** Trae el catálogo completo; si hay más registros que los recibidos, pide todos según totalCount. */
  private obtenerCatalogoCompleto(): Observable<IResponseProdServices[]> {
    return this.maestroSerivce.obtenerProdServices(1, FILAS_CATALOGO_COMPLETO).pipe(
      switchMap((resp) => {
        const servicios = resp.data?.servicios ?? [];
        const total = resp.data?.totalCount ?? 0;
        if (total > servicios.length) {
          return this.maestroSerivce.obtenerProdServices(1, total).pipe(
            map((respCompleta) => respCompleta.data?.servicios ?? [])
          );
        }
        return of(servicios);
      })
    );
  }

  private normalizar(texto: string | null | undefined): string {
    return (texto ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  }

  /** Filtra la caché por name/description, aplica el sort activo y muestra la página correspondiente. */
  private aplicarFiltro(irAPrimeraPagina: boolean): void {
    const termino = this.normalizar(this.termino);
    const filtrados = (this.catalogoCache ?? []).filter((s) =>
      this.normalizar(s.name).includes(termino) || this.normalizar(s.description).includes(termino)
    );
    this.coincidencias = this.sort ? this.dataSource.sortData(filtrados, this.sort) : filtrados;
    this.totalClientes = this.coincidencias.length;
    this.paginator.length = this.totalClientes;

    const ultimaPagina = Math.max(0, Math.ceil(this.totalClientes / this.paginator.pageSize) - 1);
    if (irAPrimeraPagina) {
      this.paginator.pageIndex = 0;
    } else if (this.paginator.pageIndex > ultimaPagina) {
      this.paginator.pageIndex = ultimaPagina;
    }
    this.mostrarPaginaCliente();
  }

  private mostrarPaginaCliente(): void {
    const inicio = this.paginator.pageIndex * this.paginator.pageSize;
    this.dataSource.data = this.coincidencias.slice(inicio, inicio + this.paginator.pageSize);
  }

  limpiarBusqueda(): void {
    this.buscadorControl.setValue('');
  }

  /** Refresca el listado tras crear/editar/eliminar respetando el modo activo. */
  private refrescarListado(): void {
    if (this.busquedaActiva) {
      this.recargaBusqueda$.next();
    } else {
      this.catalogoCache = null;
      this.cargarServicios(this.paginator.pageIndex + 1, this.paginator.pageSize);
    }
  }

  // ===== CRUD =====

  editServicio(servicio: IResponseProdServices) {
    const dialogRef = this.dialog.open(DialogFormRegProdServiceComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: { esNuevo: false, objServicio: servicio, idServicio: servicio.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refrescarListado();
      }
    });
  }

  nuevoServicio() {
    const dialogRef = this.dialog.open(DialogFormRegProdServiceComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: { esNuevo: true, objServicio: null, idServicio: 0 }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refrescarListado();
      }
    });
  }

  deleteServicio(servicio: IResponseProdServices) {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: { title: 'Eliminar Servicio', message: `¿Está seguro de eliminar el servicio ${servicio.name}?`, msgButton: 'Eliminar' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'OK') {
        this.maestroSerivce.eliminarProdService(servicio.id).subscribe({
          next: (resp) => {
            if (resp.success) {
              this.refrescarListado();
            } else {
              this.notificationService.showError(resp.message?.trim() || 'No se pudo eliminar el servicio.');
            }
          },
          error: (err) => {
            this.notificationService.showError(extractErrorMessage(err, 'No se pudo eliminar el servicio.'));
          }
        });
      }
    });
  }

}
