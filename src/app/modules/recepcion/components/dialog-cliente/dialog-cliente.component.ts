import { AfterViewChecked, AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EmisionService } from '../../services/emision.service';
import { IClienteCreate } from '../../interfaces/IClienteCreate';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarModule, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { Subscription } from 'rxjs';
import { AlertDangerComponent } from '../../../../core/components/Alerts/alert-danger/alert-danger.component';


export interface ResponseIClienteBusqueda {
  success: string;
  message: string;
  errors: string[];
  statusCode: string;
  data: IClienteBusqueda[];
}

export interface IClienteBusqueda {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  telefono: string;
}

@Component({
  selector: 'app-dialog-cliente',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule, FormsModule,
    MatTableModule, MatDialogModule, MatButtonModule,
    MatIconModule, ReactiveFormsModule, MatSnackBarModule,
    LoadingComponent, AlertDangerComponent
  ],
  templateUrl: './dialog-cliente.component.html',
  styleUrl: './dialog-cliente.component.css'
})
export class DialogClienteComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('publicSearchBox', { static: false }) searchBoxField!: ElementRef;
  readonly dialogRef = inject(MatDialogRef<DialogClienteComponent>);
  readonly data = inject<{ filtro: string }>(MAT_DIALOG_DATA);
  emisionService = inject(EmisionService);



  loadingSave = false;
  bolShowError = false;
  msgError = '';

  formRegistrarCliente: FormGroup;

  subscriptionRegistrar!: Subscription;


  // filtroNombre = '';
  // dataMock: IClienteBusqueda[] = [];
  // showNuevoCliente = false;
  // displayedColumns: string[] = ['nombres', 'apellidos', 'telefono', 'actions'];
  // dataSource = new MatTableDataSource<IClienteBusqueda>(this.dataMock);


  constructor() {
    this.formRegistrarCliente = new FormGroup({
      nombres: new FormControl('', [Validators.required]),
      telefono: new FormControl('')
    });
  }
  ngOnDestroy(): void {
    if (this.subscriptionRegistrar) this.subscriptionRegistrar.unsubscribe();
  }

  ngAfterViewChecked(): void {
    // this.searchBoxField.nativeElement.focus();
  }

  ngAfterViewInit(): void {
    // this.filtroNombre = this.data.filtro;
  }

  ngOnInit(): void {
    //TODO: filtrar al inicial con el valor que se envia en la variable data
    // console.log('filtro recibido', this.data.filtro);

  }

  // filtrar() {

  //   if (this.filtroNombre.length == 0 || this.filtroNombre == '') {
  //     return;
  //   }

  //   this.emisionService.filtrarClientesPorPatron(this.filtroNombre).subscribe({
  //     next: (response) => {
  //       this.dataSource = new MatTableDataSource<IClienteBusqueda>(response.data);
  //     },
  //     error: (error) => {
  //       console.log('error', error);
  //     }
  //   })
  // }

  // nuevoCliente() {
  //   this.showNuevoCliente = true;
  // }
  // verBusqueda() {
  //   this.showNuevoCliente = false;
  // }
  // seleccionarCliente(cliente: IClienteBusqueda) {
  //   this.dialogRef.close(cliente);
  // }

  registrarCliente() {

    if (this.formRegistrarCliente.invalid) {
      this.bolShowError = true;
        this.msgError = 'Falta ingresar los campos obligatorios';
        setTimeout(() => {
          this.bolShowError = false;
        }, 3000);
      return;
    }

    const nombres = this.formRegistrarCliente.get('nombres')?.value.toLowerCase().split(' ');
    var firstName = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
    var lastName = nombres.length > 1 ? nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1) : '';

    let cliente: IClienteCreate = {
      firstName: firstName,
      lastName: lastName,
      address: '',
      phone: this.formRegistrarCliente.get('telefono')?.value,
      email: '',
      docPersonal: '',
      status: 'A'
    }

    this.loadingSave = true;
    this.subscriptionRegistrar = this.emisionService.registrarCliente(cliente).subscribe({
      next: (data) => {
        this.loadingSave = false;
        var clienteNuevo: IClienteBusqueda = {
          id: data.id,
          codigo: '',
          nombres: data.firtsName + ' ' + data.lastName,
          apellidos: '',
          telefono: data.phone
        }
        this.dialogRef.close(clienteNuevo);
      },
      error: (error) => {
        console.log('error', error);
        this.loadingSave = false;
        this.bolShowError = true;
        this.msgError = 'Error al registrar el cliente';
        setTimeout(() => {
          this.bolShowError = false;
        }, 3000);
      }
    })
  }

  cerrar() {
    this.dialogRef.close();
  }

}
