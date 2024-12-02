import { Component, effect, inject, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { IEmisionPrevia } from '../../interfaces/IEmisionPrevia';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
import { DialogClienteComponent, IClienteBusqueda } from '../../components/dialog-cliente/dialog-cliente.component';
import { DialogPesokgComponent } from '../../components/dialog-pesokg/dialog-pesokg.component';
import { TicketVentaComponent } from '../../components/ticket-venta/ticket-venta.component';
import { IEmisionDocumento } from '../../models/IEmisionDocumento';
import { IEmisionPago } from '../../models/IEmisionPago';
import { DialogEditItemComponent } from '../../components/dialog-edit-item/dialog-edit-item.component';
import { EmisionService } from '../../services/emision.service';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { INumeracionDoc } from '../../interfaces/INumeracionDoc';
import { ICreateGuideWork } from '../../interfaces/ICreateGuideWork';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ILoginResponseData } from '../../../../core/interfaces/ILoginResponse';
import { DialogMsgComponent } from '../../components/dialog-msg/dialog-msg.component';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NotificationServiceService } from '../../services/notification-service.service';
import { LoginService } from '../../../../core/services/login.service';
import { AlertDangerComponent } from '../../../../core/components/Alerts/alert-danger/alert-danger.component';
import { MatDividerModule } from '@angular/material/divider';
import { RecepcionGrillaBusquedaServiciosComponent } from './components/recepcion-grilla-busqueda-servicios/recepcion-grilla-busqueda-servicios.component';

@Component({
  selector: 'app-recepcion-emision',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatTableModule, MatDialogModule, DatePipe, MatButtonToggleModule,
    FormsModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, CurrencyPipe,
    TicketVentaComponent, MatSlideToggleModule, LoadingComponent, MatAutocompleteModule,
    ReactiveFormsModule, AsyncPipe, AlertDangerComponent, MatDividerModule, TitleCasePipe, NgFor,
    RecepcionGrillaBusquedaServiciosComponent
  ],
  templateUrl: './recepcion-emision.component.html',
  styleUrl: './recepcion-emision.component.css'
})
export class RecepcionEmisionComponent implements OnInit, OnDestroy {
  readonly dialog = inject(MatDialog);
  readonly store = inject(EmisionStoreService);
  emisionService = inject(EmisionService);
  notificacionService = inject(NotificationServiceService);
  dataLogin = inject(LoginService);

  sucursalId = 1;
  tipoDocUsuario = 'GS';
  serieDocUsuario = '001';
  idServicioPeso = 0;
  idServicioLavado = 0;

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
  categories: IListaCategorias[] = [];
  DataDemo: IEmisionPrevia[] = [];
  displayedColumns: string[] = ['item', 'nomProd', 'Cant', 'Precio', 'Subtotal', 'actions'];
  dataSource = new MatTableDataSource<IEmisionPrevia>(this.store.items());
  numeracion: INumeracionDoc = { id: 0, branchId: 0, typeDoc: '', serieDoc: '', numberDoc: '', status: '' };

  isDelivery = false;
  blockSave = false;
  loading = false;
  loadingSave = false;
  loadingUpdatePhone = false;
  bolExisteCaja = true;
  msgValidacion = '';


  subscriptionCategorias!: Subscription;
  subscriptionNumeracion!: Subscription;
  subscriptionServixcat!: Subscription;
  subscriptionGrabarGuia!: Subscription;
  subscriptionFiltrarServixpatron!: Subscription;
  subscriptionConsulta!: Subscription;
  subscriptionIdsPesoLavado!: Subscription;

  clienteControl = new FormControl();
  filteredClientes!: Observable<IClienteBusqueda[]>;



  constructor() {
    effect(() => {
      this.dataSource.data = this.store.items();
      this.montoPago = this.store.itemSumTotal();
      this.total = this.store.itemSumTotal();
    });

    this.searchInput
      .pipe(debounceTime(300))
      .subscribe((searchTerm: string) => {
        this.searchItems();
      });
  }

  ngOnDestroy() {
    this.searchInput.complete();
    if (this.subscriptionCategorias) this.subscriptionCategorias.unsubscribe();
    if (this.subscriptionNumeracion) this.subscriptionNumeracion.unsubscribe();
    if (this.subscriptionServixcat) this.subscriptionServixcat.unsubscribe();
    if (this.subscriptionGrabarGuia) this.subscriptionGrabarGuia.unsubscribe();
    if (this.subscriptionFiltrarServixpatron) this.subscriptionFiltrarServixpatron.unsubscribe();
    if (this.subscriptionConsulta) this.subscriptionConsulta.unsubscribe();
    if (this.subscriptionIdsPesoLavado) this.subscriptionIdsPesoLavado.unsubscribe();
  }

  ngOnInit(): void {

    this.validarExisteCajaPorUsuario();

    this.filteredClientes = this.clienteControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        if (value === '') {
          return of([]);
        }
        return this.emisionService.filtrarClientesPorPatron(value).pipe(
          map(response => response.data)
        );
      })
    );

    this.obtenerIdsServicioPesoLavado();
    this.store.resetState();
    this.cargarNumeracion();
    this.cargarCategorias();
    let objPago: IEmisionPago = { tipo: 'SP', monto: 0 };
    this.store.addPago(objPago);
  }

  obtenerIdsServicioPesoLavado() {
    this.emisionService.ObtenerIdsPesoLavado().subscribe({
      next: (resp) => {
        console.log(resp);
        this.idServicioPeso = resp.data.idPeso;
        this.idServicioLavado = resp.data.idLavado;
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => { console.log('complete ObtenerIdsPesoLavado()'); }
    });
  }

  actualizarTelefonoCliente(event: any) {
    this.clienteTelefono = event.target.value;
    this.store.addCliente({ codigo: this.store.selectedCliente()?.codigo ?? 0, nombre: this.clienteNombre, telefono: this.clienteTelefono });
    this.loadingUpdatePhone = true;
    this.emisionService.ActualizarTelefonoCliente({ id: this.store.selectedCliente()?.codigo ?? 0, phone: this.clienteTelefono }).subscribe({
      next: (resp) => {
        console.log(resp);
        if (resp.success) {
          this.notificacionService.showSuccess('Se actualizó correctamente el teléfono del cliente.');
        }
        this.loadingUpdatePhone = false;
      },
      error: (err) => {
        console.log(err);
        this.loadingUpdatePhone = false;
      },
      complete: () => { console.log('complete ActualizarTelefonoCliente()'); }
    });


  }

  validarExisteCajaPorUsuario(): void {

    this.subscriptionConsulta = this.emisionService.ListarCajaPorIdUser(this.dataLogin.getLoginData()?.userId!).subscribe({
      next: (data) => {
        if (data.success) {
          if (!data.data) {
            this.bolExisteCaja = false;
          }
        } else {
          this.bolExisteCaja = false;
        }
      },
      error: (err) => {
        this.notificacionService.showError(err);
        this.bolExisteCaja = false;
        this.msgValidacion = err;
      },
      complete: () => {
        console.log('complete obtenerCajaPorUsuario()');
      }
    });
  }

  onClienteSelected(event: any) {
    const cliente = event.option.value;
    this.clienteTelefono = cliente.telefono;
    this.clienteNombre = cliente.nombres + ' ' + cliente.apellidos;
    this.store.addCliente({ codigo: cliente.id, nombre: cliente.nombres + ' ' + cliente.apellidos, telefono: cliente.telefono });
  }

  displayFn(cliente: any): string {
    return cliente && cliente.nombres && cliente.apellidos ? `${cliente.nombres} ${cliente.apellidos}` : cliente;
  }

  onSearchInputChange() {
    this.searchInput.next('');
  }

  cargarCategorias() {
    this.loading = true;
    this.subscriptionCategorias = this.emisionService.listarCategoriasSevicios().subscribe({
      next: (resp) => {
        this.loading = false;
        this.categories = resp;
      },
      error: (err) => {
        this.notificacionService.showError(err);
        this.loading = false;
      },
      complete: () => { console.log('complete listarCategoriasSevicios'); }
    });
  }

  cargarNumeracion() {
    this.subscriptionNumeracion = this.emisionService.obtenerNumeracion(this.sucursalId, this.tipoDocUsuario, this.serieDocUsuario)
      .subscribe({
        next: (resp) => {
          this.numeracion = resp.data;
          let objDoc: IEmisionDocumento = {
            tipoDoc: this.numeracion.typeDoc,
            serieDoc: this.numeracion.serieDoc,
            numeroDoc: this.numeracion.numberDoc,
            fechaEmision: new Date().toDateString(),
            fechaEntrega: new Date().toDateString()
          };
          this.store.addDocumento(objDoc);
        },
        error: (err) => {
          this.notificacionService.showError(err);
        },
        complete: () => {
          console.log('complete obtenerNumeracion');
        }
      });
  }

  mostrarMenuItems(idCat: number) {
    this.subscriptionServixcat = this.emisionService.listarSeviciosXCategorias(idCat).subscribe({
      next: (resp) => {
        this.items = resp;
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => { console.log('complete listarSeviciosXCategorias'); }
    });
    this.showMenuItems = true;
  }

  ocultarMenuItems() {
    this.showMenuItems = false;
    this.searchText = '';
  }

  agregarItem(item: IListaItemsBusqueda) {
    this.store.add({ codProd: item.id.toString(), nomProd: item.name, Cant: 1, Precio: item.price, Subtotal: item.price, Obs: '[sin comentarios]', Identificador: 'A' });
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
    let objPago: IEmisionPago = { tipo: this.tipoPago, monto: Number.parseFloat(event.target.value) };
    this.store.addPago(objPago);
    if (event.target.value < this.store.itemSumTotal()) {
      this.canceladoPago = false;
    }

  }

  openDialogCategorias(categoria: IListaCategorias) {
    const dialogRef = this.dialog.open(DialogCategoriasComponent, { data: { id: categoria.id, name: categoria.name, icon: categoria.icon } });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openDialogClientes() {
    const dialogRef = this.dialog.open(DialogClienteComponent, { data: { filtro: '' } });
    dialogRef.afterClosed().subscribe((result: IClienteBusqueda) => {
      if (result.id == undefined) return;
      this.store.addCliente({ codigo: result.id, nombre: result.nombres + ' ' + result.apellidos, telefono: result.telefono });
      this.clienteNombre = result.nombres + ' ' + result.apellidos;
      this.clienteTelefono = result.telefono;
      this.clienteControl.setValue(result.nombres, { emitEvent: false });
    });
  }

  openDialogPeso() {
    this.dialog.open(DialogPesokgComponent,
      {
        data:
        {
          inTitulo: 'Lavado por Peso Kg.',
          inIdServicio: this.idServicioPeso,
          inDesServicio: 'Peso',
          inEsPeso: true,
          inPrecio: 3
        }
      });
  }

  openDialogLavado() {
    this.dialog.open(DialogPesokgComponent,
      {
        data:
        {
          inTitulo: 'Lavado',
          inIdServicio: this.idServicioLavado,
          inDesServicio: 'Lavado',
          inEsPeso: false,
          inPrecio: 1
        }
      });
  }

  openDialogAddItem(ele: IListaItemsBusqueda) {
    this.store.select(ele.id);
    this.dialog.open(DialogEditItemComponent, { data: { edicion: false, item: ele } })
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
    this.actualizarPago()
  }

  actualizarPago(bolHack: any = false) {    
    this.montoPago = this.store.itemSumTotal();
    let objPago: IEmisionPago = { tipo: this.tipoPago, monto: this.tipoPago == 'SP' ? 0 : this.montoPago };
    this.store.addPago(objPago);
  }

  grabarRecibo() {

    if (!this.store.selectedCliente()) {
      this.dialog.open(DialogMsgComponent, { data: { title: 'Error', msg: 'Debe seleccionar un cliente antes de grabar el recibo.', err: true } });
      return;
    }

    if (this.store.items().length === 0) {
      this.dialog.open(DialogMsgComponent, { data: { title: 'Error', msg: 'Debe agregar al menos un item antes de grabar el recibo.', err: true } });
      return;
    }

    // Leer los datos del localStorage
    const storedData = localStorage.getItem('dex24Auth');
    if (storedData == null) {
      this.dialog.open(DialogMsgComponent, { data: { title: 'Error', msg: 'No se encontraron datos de autenticación en el sistema.', err: true } });
      return;
    }
    const parsedData: ILoginResponseData = JSON.parse(storedData);

    let objGuia: ICreateGuideWork = {
      serieGuia: this.numeracion.serieDoc,
      numeroGuia: this.numeracion.numberDoc.toString(),
      mensajeAlertas: '',
      observaciones: '',
      tipoPago: this.tipoPago,
      descripcionPago: '',
      tipoRecepcion: this.isDelivery ? 'D' : 'R',
      direccionContacto: '',
      telefonoContacto: '',
      total: this.store.itemSumTotal(),
      acuenta: this.store.selectedPago()?.monto ?? 0,
      saldo: this.store.itemSumTotal() - (this.store.selectedPago()?.monto ?? 0),
      customerId: this.store.selectedCliente()?.codigo ?? 0,

      branchStoreId: parsedData.branchSales[0].branchSalesId,
      typeDocument: this.tipoDocUsuario,
      userId: parsedData.userId,
      estadoPago: this.store.itemSumTotal() === this.store.selectedPago()?.monto ? 'PA' : 'PE', // PE: Pendiente, PA: Pagado, AN: Anulado      
      estadoRegistro: "A",
      estadoSituacion: "P",

      workGuideDetailsDTO: this.store.items().map((item, index) => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const identifier = alphabet[index % alphabet.length];
        return {
          cant: item.Cant,
          precio: item.Precio,
          total: item.Subtotal,
          observaciones: item.Obs,
          tipoLavado: 'A',            // A=agua; S=seco
          ubicacion: 'L',             // L=lavanderia; P=planta; A=almacen
          estadoTrabajo: 'P',         // P: Pendiente, E: En Proceso, F: Finalizado
          productId: parseInt(item.codProd),
          estadoRegistro: 'A',        // A: Activo, I: Inactivo    
          estadoSituacion: 'P',       // P: Pendiente, E: Entregado; D: Devuelto
          estadoPago: 'PE',           // PE: Pendiente, PA: Pagado, AN: Anulado
          identificador: identifier
        }
      })
    };



    this.loadingSave = true;
    this.subscriptionGrabarGuia = this.emisionService.grabarGuiaTrabajo(objGuia).subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.blockSave = true;
        this.dialog.open(DialogMsgComponent, { data: { title: 'Mensaje', msg: 'Se grabó correctamente la guía de trabajo.', err: false } });
      },
      error: (err) => {
        this.notificacionService.showError(err);
        this.loadingSave = false;
        this.dialog.open(DialogMsgComponent, { data: { title: 'Error', msg: err, err: true } });
      },
      complete: () => { console.log('complete grabarRecibo'); }
    });

  }

  imprimirTicket() {
    window.print();
  }

  searchItems() {
    if (this.searchText.trim() == '') {
      this.showMenuItems = false;
      return;
    }

    this.subscriptionFiltrarServixpatron = this.emisionService.filtrarServiciosPorPatron(this.searchText).subscribe({
      next: (resp) => {
        this.items = resp;
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => { console.log('complete filtrarServiciosPorPatron'); }
    });
    this.showMenuItems = true;
  }

  onChangueToggle(event: any) {
    console.log('event.checked:::', event.checked);
    this.store.addRecepcion(event.checked ? 'D' : 'R');
    this.isDelivery = event.checked;
  }

  nuevaGuia() {
    this.store.resetState();
    this.cargarNumeracion();
    this.tipoPago = 'SP';
    this.showPago = false;
    this.clienteNombre = '';
    this.clienteTelefono = '';
    this.blockSave = false;
    this.isDelivery = false;
    this.actualizarPago();
    this.clienteControl.setValue('');
  }
}
