import { Component, effect, inject, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { IEmisionPrevia } from '../../interfaces/IEmisionPrevia';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogCategoriasComponent } from '../../components/dialog-categorias/dialog-categorias.component';
import { IListaCategorias } from '../../interfaces/IListaCategorias';
import { EmisionStoreService } from '../../services/emision.store.service';
import { AsyncPipe, DatePipe, NgFor, TitleCasePipe } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IListaItemsBusqueda } from '../../interfaces/IListaItemsBusqueda';
import { CurrencyPipe } from '@angular/common';
import {
  DialogClienteComponent,
  IClienteBusqueda,
} from '../../components/dialog-cliente/dialog-cliente.component';
import { DialogPesokgComponent } from '../../components/dialog-pesokg/dialog-pesokg.component';
import { TicketVentaComponent } from '../../components/ticket-venta/ticket-venta.component';
import { IEmisionDocumento } from '../../models/IEmisionDocumento';
import { IEmisionPago } from '../../models/IEmisionPago';
import { DialogEditItemComponent } from '../../components/dialog-edit-item/dialog-edit-item.component';
import { EmisionService } from '../../services/emision.service';
import {
  firstValueFrom,
  forkJoin,
  Observable,
  of,
  Subject,
  Subscription,
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { INumeracionDoc } from '../../interfaces/INumeracionDoc';
import {
  ICreateGuideWork,
  WgdCreateResponseDto,
} from '../../interfaces/ICreateGuideWork';
import { InspeccionService } from '../../services/inspeccion.service';
import { DialogInspeccionItemComponent } from '../../components/dialog-inspeccion-item/dialog-inspeccion-item.component';
import { DialogZapatillaItemComponent } from '../../components/dialog-zapatilla-item/dialog-zapatilla-item.component';
import { IEmisionItem } from '../../models/IEmisionItems';
import { isSneakerCategory } from '../../shared/sneaker-category.util';
import { isPesoItem } from '../../shared/peso-item.util';
import { isLavadoItem } from '../../shared/lavado-item.util';
import { agregarItemZapatillaDirecto } from '../../shared/agregar-item-zapatilla.util';
import { formatearZapatillaDraft } from '../../shared/zapatilla-draft-format.util';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BranchSale, ILoginResponseData } from '../../../../core/interfaces/ILoginResponse';
import { DialogMsgComponent } from '../../components/dialog-msg/dialog-msg.component';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NotificationServiceService } from '../../services/notification-service.service';
import { LoginService } from '../../../../core/services/login.service';
import { AlertDangerComponent } from '../../../../core/components/Alerts/alert-danger/alert-danger.component';
import { MatDividerModule } from '@angular/material/divider';
import { RecepcionGrillaBusquedaServiciosComponent } from './components/recepcion-grilla-busqueda-servicios/recepcion-grilla-busqueda-servicios.component';
import { IResponseServiceQuickAccess } from '../../interfaces/IProdServices';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RecepcionVentanaFlotanteBusquedaComponent } from './components/recepcion-ventana-flotante-busqueda/recepcion-ventana-flotante-busqueda.component';

@Component({
  selector: 'app-recepcion-emision',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    DatePipe,
    MatButtonToggleModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    CurrencyPipe,
    TicketVentaComponent,
    MatSlideToggleModule,
    LoadingComponent,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    AlertDangerComponent,
    MatDividerModule,
    TitleCasePipe,
    NgFor,
    RecepcionGrillaBusquedaServiciosComponent,
    MatSelectModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './recepcion-emision.component.html',
  styleUrl: './recepcion-emision.component.css',
})
export class RecepcionEmisionComponent implements OnInit, OnDestroy {
  readonly dialog = inject(MatDialog);
  readonly store = inject(EmisionStoreService);
  emisionService = inject(EmisionService);
  notificacionService = inject(NotificationServiceService);
  dataLogin = inject(LoginService);
  inspeccionService = inject(InspeccionService);

  sucursalId = 1;
  sucursalNombre = '[Seleccione Sucursal]';

  fechaHoy = Date.now();
  fechaHEntrega = Date.now() + 2 * 24 * 60 * 60 * 1000;
  tipoPago = 'SP';
  montoPago = 0;
  canceladoPago = true;
  showPago = false;
  showMenuItems = false;
  clienteNombre = '';
  clienteTelefono = '';
  total = 0;
  searchText = '';
  searchInput = new Subject<string>();

  items: IListaItemsBusqueda[] = [];
  categories: IListaCategorias[] = [
    {
      id: 1,
      name: 'Peso',
      icon: 'scale',
    },
    {
      id: 2,
      name: 'Vestir',
      icon: 'checkroom',
    },
    {
      id: 3,
      name: 'Diario',
      icon: 'group',
    },
    {
      id: 4,
      name: 'Cama',
      icon: 'bed',
    },
    {
      id: 5,
      name: 'Hogar',
      icon: 'home',
    },
    {
      id: 6,
      name: 'Calzado',
      icon: 'roller_skating',
    },
    {
      id: 7,
      name: 'Teñidos',
      icon: 'palette',
    },
    {
      id: 8,
      name: 'Otros',
      icon: 'cloud',
    },
  ];
  dataServiciosAccesosRapido: IResponseServiceQuickAccess[] = [];
  DataDemo: IEmisionPrevia[] = [];
  displayedColumns: string[] = ['item', 'nomProd', 'Subtotal', 'actions'];
  dataSource = new MatTableDataSource<IEmisionPrevia>(this.store.items());
  numeracion: INumeracionDoc = {
    id: 0,
    branchId: 0,
    typeDoc: '',
    serieDoc: '',
    numberDoc: '',
    status: '',
  };

  isDelivery = false;
  isEtiqueta = false;
  blockSave = false;
  loading = false;
  loadingSave = false;
  loadingUpdatePhone = false;
  loadingFilterServices = false;
  loadingServicesQuick = false;
  bolExisteCaja = true;
  msgValidacion = '';
  isSinCopia = false;
  guiaCreadaId: number | null = null;
  loadingImprimir = false;

  subscriptionCategorias!: Subscription;
  subscriptionNumeracion!: Subscription;
  subscriptionServixcat!: Subscription;
  subscriptionGrabarGuia!: Subscription;
  subscriptionFiltrarServixpatron!: Subscription;
  subscriptionIdsPesoLavado!: Subscription;
  subscriptionQuickAccess!: Subscription;

  clienteControl = new FormControl();
  filteredClientes!: Observable<IClienteBusqueda[]>;

  sucursales: BranchSale[] = [];

  ventanaFlotanteRef: MatDialogRef<RecepcionVentanaFlotanteBusquedaComponent> | null = null;

  constructor() {
    effect(() => {
      this.dataSource.data = this.store.items();
      this.montoPago = this.store.itemSumTotal();
      this.total = this.store.itemSumTotal();
    });

    this.searchInput.pipe(debounceTime(300)).subscribe((searchTerm: string) => {
      this.searchItems();
    });
  }

  ngOnDestroy() {
    this.searchInput.complete();
    if (this.subscriptionCategorias) this.subscriptionCategorias.unsubscribe();
    if (this.subscriptionNumeracion) this.subscriptionNumeracion.unsubscribe();
    if (this.subscriptionServixcat) this.subscriptionServixcat.unsubscribe();
    if (this.subscriptionGrabarGuia) this.subscriptionGrabarGuia.unsubscribe();
    if (this.subscriptionFiltrarServixpatron)
      this.subscriptionFiltrarServixpatron.unsubscribe();
    if (this.subscriptionIdsPesoLavado)
      this.subscriptionIdsPesoLavado.unsubscribe();
    if (this.subscriptionQuickAccess)
      this.subscriptionQuickAccess.unsubscribe();
  }

  async ngOnInit(): Promise<void> {
    const existeCaja = await this.validarExisteCajaPorUsuario();
    console.log('existeCaja:', existeCaja);
    console.log('existe caja:', existeCaja);

    if (!existeCaja) {
      this.cargarSucursalesLocalStorage();
    }

    this.filteredClientes = this.clienteControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        if (!value || typeof value !== 'string' || value.trim().length < 3) {
          return of([]);
        }
        if (value === '') {
          return of([]);
        }

        if (typeof value === 'object') {
          console.log('es objeto', value);
          return of([value]);
        }

        return this.emisionService
          .filtrarClientesPorPatron(value)
          .pipe(map((response) => response.data));
      }),
    );

    this.store.resetState();
    // this.cargarNumeracion();
    this.cargarCategorias();
    this.cargarServiciosAccesosRapido();
    let objPago: IEmisionPago = { tipo: 'SP', monto: 0 };
    this.store.addPago(objPago);
    this.store.addUser(this.dataLogin.getLoginData()?.userName!);
  }

  cargarSucursalesLocalStorage() {
    const storedData = localStorage.getItem('dex24Auth');
    if (storedData == null) {
      this.dialog.open(DialogMsgComponent, {
        data: {
          title: 'Error',
          msg: 'No se encontraron datos de autenticación en el sistema.',
          err: true,
        },
      });
      return;
    }
    const parsedData: ILoginResponseData = JSON.parse(storedData);

    this.sucursales = parsedData.branchSales;
    this.sucursalId = parsedData.branchSales[0]?.branchSalesId ?? 0;
  }

  applyFilterSucursal(event: any) {
    //no se usa
    console.log(event);
  }

  cargarServiciosAccesosRapido() {
    this.loadingServicesQuick = true;
    this.emisionService.ListarServiciosAccesoRapido().subscribe({
      next: (resp) => {
        console.log(resp);
        this.loadingServicesQuick = false;
        this.dataServiciosAccesosRapido = resp.data;
      },
      error: (err) => {
        console.log(err);
        this.loadingServicesQuick = false;
      },
    });
  }

  agregarItemQuickAccess(item: IResponseServiceQuickAccess): void {
    if (isPesoItem(item.isPeso)) {
      this.subscriptionQuickAccess = this.dialog
        .open(DialogPesokgComponent, {
          data: {
            inTitulo: item.shortName,
            inIdServicio: item.prodServiceID,
            inDesServicio: item.shortName,
            inEsPeso: true,
            inPrecio: item.price,
          },
        })
        .afterClosed()
        .subscribe((_) => this.actualizarPago());
      return;
    }

    if (isLavadoItem(item.isLavado)) {
      this.subscriptionQuickAccess = this.dialog
        .open(DialogPesokgComponent, {
          data: {
            inTitulo: item.shortName,
            inIdServicio: item.prodServiceID,
            inDesServicio: item.shortName,
            inEsPeso: false,
            inPrecio: item.price,
          },
        })
        .afterClosed()
        .subscribe((_) => this.actualizarPago());
      return;
    }

    let itemBusqueda: IListaItemsBusqueda = {
      id: item.prodServiceID,
      name: item.shortName,
      price: item.price,
      categoryDescription: item.categoryDescription,
    };

    if (isSneakerCategory(itemBusqueda.categoryDescription)) {
      agregarItemZapatillaDirecto(this.dialog, this.store, itemBusqueda);
      this.actualizarPago();
      return;
    }

    this.store.select(item.id);
    this.subscriptionQuickAccess = this.dialog
      .open(DialogEditItemComponent, {
        data: { edicion: false, item: itemBusqueda },
        width: '100%',
        height: '100%',
      })
      .afterClosed()
      .subscribe((_) => this.actualizarPago());
  }

  actualizarTelefonoCliente(event: any) {
    this.clienteTelefono = event.target.value;

    // TODO: hay que obtener el numero de digitos de una tabla de configuracion
    // Validar que el número de teléfono tenga 9 dígitos
    const telefono = this.clienteTelefono.replace(/\D/g, '');
    if (telefono.length !== 9) {
      this.notificacionService.showError(
        'El número de teléfono debe tener 9 dígitos.',
      );
      return;
    }

    this.store.addCliente({
      codigo: this.store.selectedCliente()?.codigo ?? 0,
      nombre: this.clienteNombre,
      telefono: this.clienteTelefono,
    });
    this.loadingUpdatePhone = true;
    this.emisionService
      .ActualizarTelefonoCliente({
        id: this.store.selectedCliente()?.codigo ?? 0,
        phone: this.clienteTelefono,
      })
      .subscribe({
        next: (resp) => {
          console.log(resp);
          if (resp.success) {
            this.notificacionService.showSuccess(
              'Se actualizó correctamente el teléfono del cliente.',
            );
          }
          this.loadingUpdatePhone = false;
        },
        error: (err) => {
          console.log(err);
          this.loadingUpdatePhone = false;
        },
        complete: () => {
          console.log('complete ActualizarTelefonoCliente()');
        },
      });
  }

  async validarExisteCajaPorUsuario(): Promise<boolean> {
    try {
      const data = await firstValueFrom(
        this.emisionService.ListarCajaPorIdUser(
          this.dataLogin.getLoginData()?.userId!,
        ),
      );

      if (!data.success || !data.data) {
        this.bolExisteCaja = false;
        return false;
      }

      this.bolExisteCaja = true;
      this.sucursalId = data.data.branchSalesId;

      const storedData = localStorage.getItem('dex24Auth');
      if (storedData == null) {
        this.dialog.open(DialogMsgComponent, {
          data: {
            title: 'Error',
            msg: 'No se encontraron datos de autenticación en el sistema.',
            err: true,
          },
        });
        return false;
      }
      const parsedData: ILoginResponseData = JSON.parse(storedData);
      const foundSucursal = parsedData.branchSales.find(
        (sucursal: any) => sucursal.branchSalesId == this.sucursalId,
      );

      this.sucursalNombre = foundSucursal
        ? foundSucursal.branchSalesName
        : '[Sucursal no encontrada]';

      return true;
    } catch (err: any) {
      this.notificacionService.showError(err);
      this.bolExisteCaja = false;
      this.msgValidacion = err;
      return false;
    }
  }

  onClienteSelected(event: any) {
    const cliente = event.option.value;
    this.clienteTelefono = cliente.telefono;
    this.clienteNombre = cliente.nombres + ' ' + cliente.apellidos;
    this.store.addCliente({
      codigo: cliente.id,
      nombre: cliente.nombres + ' ' + cliente.apellidos,
      telefono: cliente.telefono,
    });
  }

  displayFn(cliente: any): string {
    return cliente && cliente.nombres
      ? `${cliente.nombres} ${cliente.apellidos}`
      : cliente;
  }

  onSearchInputChange() {
    this.searchInput.next('');
  }

  cargarCategorias() {
    // this.loading = true;
    // this.subscriptionCategorias = this.emisionService.listarCategoriasSevicios().subscribe({
    //   next: (resp) => {
    //     this.loading = false;
    //     this.categories = resp;
    //   },
    //   error: (err) => {
    //     this.notificacionService.showError(err);
    //     this.loading = false;
    //   },
    //   complete: () => { console.log('complete listarCategoriasSevicios'); }
    // });
  }

  cargarNumeracion() {
    this.subscriptionNumeracion = this.emisionService
      .obtenerNumeracion(this.sucursalId, 'GS', '001')
      .subscribe({
        next: (resp) => {
          this.numeracion = resp.data;
          let objDoc: IEmisionDocumento = {
            tipoDoc: this.numeracion.typeDoc,
            serieDoc: this.numeracion.serieDoc,
            numeroDoc: this.numeracion.numberDoc,
            fechaEmision: new Date().toDateString(),
            fechaEntrega: new Date().toDateString(),
          };
          this.store.addDocumento(objDoc);
        },
        error: (err) => {
          this.notificacionService.showError(err);
        },
        complete: () => {
          console.log('complete obtenerNumeracion');
        },
      });
  }

  mostrarMenuItems(idCat: number) {
    this.subscriptionServixcat = this.emisionService
      .listarSeviciosXCategorias(idCat)
      .subscribe({
        next: (resp) => {
          this.items = resp;
        },
        error: (err) => {
          console.log(err);
        },
        complete: () => {
          console.log('complete listarSeviciosXCategorias');
        },
      });
    this.showMenuItems = true;
  }

  ocultarMenuItems() {
    this.showMenuItems = false;
    this.searchText = '';
  }

  agregarItem(item: IListaItemsBusqueda) {
    this.store.add({
      codProd: item.id.toString(),
      nomProd: item.name,
      Cant: 1,
      Precio: item.price,
      Subtotal: item.price,
      Obs: '[sin comentarios]',
      Identificador: 'A',
    });
  }

  onValChangePago(value: any) {
    this.showPago = true;
    if (value == 'SP') {
      this.showPago = false;
      this.canceladoPago = true;
    }
    this.actualizarPago();
  }

  updateCancelado(value: any) {
    if (value) {
      this.actualizarPago();
    }
  }

  onFocusOutEvent(event: any) {
    let objPago: IEmisionPago = {
      tipo: this.tipoPago,
      monto: Number.parseFloat(event.target.value),
    };
    this.store.addPago(objPago);
    if (event.target.value < this.store.itemSumTotal()) {
      this.canceladoPago = false;
    }
  }

  openDialogCategorias(categoria: IListaCategorias) {
    const dialogRef = this.dialog.open(DialogCategoriasComponent, {
      data: { id: categoria.id, name: categoria.name, icon: categoria.icon },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  openDialogClientes() {
    const dialogRef = this.dialog.open(DialogClienteComponent, {
      data: { filtro: '' },
    });
    dialogRef.afterClosed().subscribe((result: IClienteBusqueda) => {
      if (result.id == undefined) return;
      this.store.addCliente({
        codigo: result.id,
        nombre: result.nombres + ' ' + result.apellidos,
        telefono: result.telefono,
      });
      this.clienteNombre = result.nombres + ' ' + result.apellidos;
      this.clienteTelefono = result.telefono;
      this.clienteControl.setValue(result.nombres, { emitEvent: false });
    });
  }

  abrirVentanaFlotanteBusqueda(): void {
    const customerId = this.store.selectedCliente()?.codigo;
    if (!customerId || this.ventanaFlotanteRef) {
      return;
    }

    this.ventanaFlotanteRef = this.dialog.open(RecepcionVentanaFlotanteBusquedaComponent, {
      panelClass: 'ventana-flotante-panel',
      hasBackdrop: false,
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      width: '460px',
      height: '640px',
      position: { top: '110px', right: '32px' },
      data: { customerId },
    });

    this.ventanaFlotanteRef.afterClosed().subscribe(() => {
      this.ventanaFlotanteRef = null;
    });
  }

  openDialogAddItem(ele: IListaItemsBusqueda) {
    this.store.select(ele.id);
    this.dialog
      .open(DialogEditItemComponent, { data: { edicion: false, item: ele } })
      .afterClosed()
      .subscribe((_) => this.actualizarPago());
  }

  editData(ele: any) {
    console.log('editando:', ele);
    this.store.select(ele.id);
    this.dialog.open(DialogEditItemComponent, { data: { edicion: true } });
  }

  deleteData(ele: any) {
    this.store.delete(ele.id);
    this.actualizarPago();
  }

  actualizarPago(bolHack: any = false) {
    this.montoPago = this.store.itemSumTotal();
    let objPago: IEmisionPago = {
      tipo: this.tipoPago,
      monto: this.tipoPago == 'SP' ? 0 : this.montoPago,
    };
    this.store.addPago(objPago);
  }

  grabarRecibo() {
    if (this.sucursalId == 0) {
      this.dialog.open(DialogMsgComponent, {
        data: {
          title: 'Error',
          msg: 'Debe seleccionar una sucursal antes de grabar el recibo.',
          err: true,
        },
      });
      return;
    }

    if (!this.store.selectedCliente()) {
      this.dialog.open(DialogMsgComponent, {
        data: {
          title: 'Error',
          msg: 'Debe seleccionar un cliente antes de grabar el recibo.',
          err: true,
        },
      });
      return;
    }

    if (this.store.items().length === 0) {
      this.dialog.open(DialogMsgComponent, {
        data: {
          title: 'Error',
          msg: 'Debe agregar al menos un item antes de grabar el recibo.',
          err: true,
        },
      });
      return;
    }

    // Leer los datos del localStorage
    const storedData = localStorage.getItem('dex24Auth');
    if (storedData == null) {
      this.dialog.open(DialogMsgComponent, {
        data: {
          title: 'Error',
          msg: 'No se encontraron datos de autenticación en el sistema.',
          err: true,
        },
      });
      return;
    }
    const parsedData: ILoginResponseData = JSON.parse(storedData);

    let estadoPagoInicial =
      this.store.itemSumTotal() === this.store.selectedPago()?.monto
        ? 'PA'
        : 'PE'; // PE: Pendiente, PA: Pagado, AN: Anulado

    // se congela el orden de los items ANTES de grabar, para poder matchear 1 a 1
    // contra el arreglo `details` que devuelve el backend al crear la guía
    const itemsSnapshot = this.store.items();

    let objGuia: ICreateGuideWork = {
      serieGuia: '',
      numeroGuia: '',
      mensajeAlertas: '',
      observaciones: '',
      tipoPago: this.tipoPago,
      descripcionPago: '',
      tipoRecepcion: this.isDelivery ? 'D' : 'R',
      direccionContacto: '',
      telefonoContacto: '',
      total: this.store.itemSumTotal(),
      acuenta: this.store.selectedPago()?.monto ?? 0,
      saldo:
        this.store.itemSumTotal() - (this.store.selectedPago()?.monto ?? 0),
      customerId: this.store.selectedCliente()?.codigo ?? 0,

      branchStoreId: this.sucursalId,
      typeDocument: '',
      userId: parsedData.userId,
      estadoPago: estadoPagoInicial, // PE: Pendiente, PA: Pagado, AN: Anulado
      estadoRegistro: 'A',
      estadoSituacion: 'P',
      PrintCopy: this.store.selectedSinCopia() ? 0 : 1,

      workGuideDetailsDTO: itemsSnapshot.map((item, index) => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const identifier = alphabet[index % alphabet.length];
        return {
          cant: item.Cant,
          precio: item.Precio,
          total: item.Subtotal,
          observaciones: item.Obs,
          tipoLavado: 'A', // A=agua; S=seco
          ubicacion: 'L', // L=lavanderia; P=planta; A=almacen
          estadoTrabajo: 'P', // P: Pendiente, E: En Proceso, F: Finalizado
          productId: parseInt(item.codProd),
          estadoRegistro: 'A', // A: Activo, I: Inactivo
          estadoSituacion: 'P', // P: Pendiente, E: Entregado; D: Devuelto
          estadoPago: estadoPagoInicial, // PE: Pendiente, PA: Pagado, AN: Anulado
          identificador: identifier,
        };
      }),
    };

    this.loadingSave = true;
    this.subscriptionGrabarGuia = this.emisionService
      .grabarGuiaTrabajo(objGuia)
      .subscribe({
        next: (resp) => {
          this.loadingSave = false;
          this.blockSave = true;
          this.guiaCreadaId = resp.data.idWorkGuide;

          let objDoc: IEmisionDocumento = {
            tipoDoc: resp.data.tipoDocumento,
            serieDoc: resp.data.serieDocumento,
            numeroDoc: resp.data.numeroDocumento,
            fechaEmision: resp.data.fechaOperacion,
            fechaEntrega: resp.data.fechaHoraEntrega,
          };
          this.store.addDocumento(objDoc);

          this.notificacionService.showSuccessDialog(
            'Se grabó correctamente la guía de trabajo.',
            '# ' + resp.data.numeroDocumento,
          );

          this.registrarInspeccionesYZapatillasPendientes(
            itemsSnapshot,
            resp.data.details,
          );
        },
        error: (err) => {
          this.notificacionService.showError(err);
          this.loadingSave = false;
          this.dialog.open(DialogMsgComponent, {
            data: { title: 'Error', msg: err, err: true },
          });
          this.notificacionService.showErrorDialog(
            'Ocurrio un error al intentar grabar la guia',
          );
        },
        complete: () => {
          console.log('complete grabarRecibo');
        },
      });
  }

  imprimirTicket() {
    window.print();
  }

  imprimirGuiaCreada() {
    if (!this.guiaCreadaId || this.loadingImprimir) {
      return;
    }

    this.loadingImprimir = true;
    const printCopy = this.store.selectedSinCopia() ? 0 : 1;
    this.emisionService.ReimprimirGuia(this.guiaCreadaId, printCopy).subscribe({
      next: (resp) => {
        this.loadingImprimir = false;
        if (!resp.success) {
          this.notificacionService.showError(resp.message);
          return;
        }
        this.notificacionService.showSuccess(resp.message || 'Ticket enviado a imprimir');
      },
      error: (err) => {
        this.loadingImprimir = false;
        const mensaje = err?.error?.message || 'No se pudo imprimir la guía.';
        this.notificacionService.showError(mensaje);
      }
    });
  }

  searchItems() {
    if (this.searchText.trim() == '') {
      this.showMenuItems = false;
      return;
    }
    this.loadingFilterServices = true;
    this.subscriptionFiltrarServixpatron = this.emisionService
      .filtrarServiciosPorPatron(this.searchText)
      .subscribe({
        next: (resp) => {
          this.loadingFilterServices = false;
          this.items = resp;
        },
        error: (err) => {
          this.loadingFilterServices = false;
          console.log(err);
        },
        complete: () => {
          console.log('complete filtrarServiciosPorPatron');
        },
      });
    this.showMenuItems = true;
  }

  onChangueToggle(event: any) {
    this.store.addRecepcion(event.checked ? 'D' : 'R');
    this.isDelivery = event.checked;
  }

  onChangueToggleBolsa(event: any) {
    this.store.addBolsa(event.checked);
  }

  onChangueToggleSinCopia(event: any) {
    this.store.addSinCopia(event.checked);
  }

  nuevaGuia() {
    this.ventanaFlotanteRef?.close();
    this.store.resetState();
    this.store.addUser(this.dataLogin.getLoginData()?.userName!);
    // this.cargarNumeracion();
    this.tipoPago = 'SP';
    this.showPago = false;
    this.clienteNombre = '';
    this.clienteTelefono = '';
    this.blockSave = false;
    this.guiaCreadaId = null;
    this.isDelivery = false;
    this.isEtiqueta = false;
    this.actualizarPago();
    this.clienteControl.setValue('');
  }

  abrirInspeccionItem(item: any) {
    this.dialog
      .open(DialogInspeccionItemComponent, {
        data: {
          workGuideDetailId: null,
          productName: item.nomProd,
          initialValue: this.store.getInspeccionDraft(item.id),
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.draft) {
          this.store.setInspeccionDraft(item.id, result.draft);
        }
      });
  }

  abrirZapatillaItem(item: any) {
    this.dialog
      .open(DialogZapatillaItemComponent, {
        data: {
          workGuideDetailId: null,
          productName: item.nomProd,
          initialValue: this.store.getZapatillaDraft(item.id),
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result?.draft) return;

        this.store.setZapatillaDraft(item.id, result.draft);
        this.store.update({
          ...item,
          Obs: formatearZapatillaDraft(result.draft, result.brandName),
        });
      });
  }

  esZapatilla(item: any): boolean {
    return isSneakerCategory(item.categoryDescription);
  }

  tieneInspeccionDraft(item: any): boolean {
    return this.store.hasInspeccionDraft(item.id);
  }

  tieneZapatillaDraft(item: any): boolean {
    return this.store.hasZapatillaDraft(item.id);
  }

  /**
   * Encadena, recién después de grabada la guía, las llamadas de inspección/zapatilla
   * pendientes usando los WorkGuideDetail.id que recién devolvió el backend
   * (mismo orden en que se enviaron los items en workGuideDetailsDTO).
   */
  private registrarInspeccionesYZapatillasPendientes(
    itemsSnapshot: IEmisionItem[],
    details: WgdCreateResponseDto[],
  ) {
    const llamadas: Observable<unknown>[] = [];
    const inspeccionDrafts = this.store.getAllInspeccionDrafts();
    const zapatillaDrafts = this.store.getAllZapatillaDrafts();

    itemsSnapshot.forEach((item, index) => {
      const detalle = details?.[index];
      if (!detalle) return;

      const inspeccion = inspeccionDrafts.get(item.id);
      if (inspeccion) {
        llamadas.push(
          this.inspeccionService.guardarInspeccion(detalle.id, inspeccion).pipe(
            catchError((err) => {
              console.log('Error guardando inspección de', item.nomProd, err);
              return of(null);
            }),
          ),
        );
      }

      const zapatilla = zapatillaDrafts.get(item.id);
      if (zapatilla) {
        llamadas.push(
          this.inspeccionService
            .guardarInfoZapatilla(detalle.id, zapatilla)
            .pipe(
              catchError((err) => {
                console.log(
                  'Error guardando info de zapatilla de',
                  item.nomProd,
                  err,
                );
                return of(null);
              }),
            ),
        );
      }
    });

    if (llamadas.length === 0) {
      return;
    }

    forkJoin(llamadas).subscribe((resultados) => {
      const fallidos = resultados.filter((r) => r === null).length;
      if (fallidos === 0) {
        this.notificacionService.showSuccess(
          `Se registraron ${resultados.length} dato(s) de inspección/zapatilla asociados al ticket.`,
        );
      } else {
        this.notificacionService.showError(
          `${fallidos} de ${resultados.length} registro(s) de inspección/zapatilla no se pudieron guardar. Complétalos luego desde Retiros.`,
        );
      }
      inspeccionDrafts.clear();
      zapatillaDrafts.clear();
    });
  }
}
