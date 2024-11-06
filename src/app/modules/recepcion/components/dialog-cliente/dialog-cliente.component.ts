import { AfterViewChecked, AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
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
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatTableModule, MatDialogModule, MatButtonModule, MatIconModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './dialog-cliente.component.html',
  styleUrl: './dialog-cliente.component.css'
})
export class DialogClienteComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('publicSearchBox', { static: false }) searchBoxField!: ElementRef;
  readonly dialogRef = inject(MatDialogRef<DialogClienteComponent>);
  readonly data = inject<{ filtro: string }>(MAT_DIALOG_DATA);
  emisionService = inject(EmisionService);
  private _snackBar = inject(MatSnackBar);

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  filtroNombre = '';
  dataMock: IClienteBusqueda[] = [];
  showNuevoCliente = false;

  displayedColumns: string[] = ['nombres', 'apellidos', 'telefono', 'actions'];
  dataSource = new MatTableDataSource<IClienteBusqueda>(this.dataMock);

  formRegistrarCliente: FormGroup;

  constructor() {
    this.formRegistrarCliente = new FormGroup({
      nombres: new FormControl('', [Validators.required]),
      telefono: new FormControl('')
    });
  }

  ngAfterViewChecked(): void {
    console.log('ngAfterViewChecked()');
    // this.searchBoxField.nativeElement.select();
    this.searchBoxField.nativeElement.focus();

  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit()');
    this.filtroNombre = this.data.filtro;
  }

  ngOnInit(): void {
    //TODO: filtrar al inicial con el valor que se envia en la variable data
    // console.log('filtro recibido', this.data.filtro);

  }

  filtrar() {
    console.log('filtrando....');


    if (this.filtroNombre.length == 0 || this.filtroNombre == '') {
      return;
    }

    this.emisionService.filtrarClientesPorPatron(this.filtroNombre).subscribe({
      next: (response) => {
        this.dataSource = new MatTableDataSource<IClienteBusqueda>(response.data);
      },
      error: (error) => {
        console.log('error', error);
      },
      complete: () => {
        console.log('complete');
      }
    })
  }

  nuevoCliente() {
    this.showNuevoCliente = true;
  }
  verBusqueda() {
    this.showNuevoCliente = false;
  }
  seleccionarCliente(cliente: IClienteBusqueda) {
    this.dialogRef.close(cliente);
  }

  registrarCliente() {
    console.log('registrando cliente', this.formRegistrarCliente.value);

    const nombres = this.formRegistrarCliente.get('nombres')?.value.toLowerCase().split(' ');
    var firstName = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
    var lastName = nombres.length > 1 ? nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1) : '';

    let cliente: IClienteCreate = {
      firtsName: firstName,
      lastName: lastName,
      address: '',
      phone: this.formRegistrarCliente.get('telefono')?.value,
      email: '',
      docPersonal: '',
      status: 'A'
    }

    this.emisionService.registrarCliente(cliente).subscribe({
      next: (data) => {
        console.log('data', data);

        var clienteNuevo: IClienteBusqueda = {
          id: data.id,
          codigo: '',
          nombres: data.firtsName + ' ' + data.lastName,
          apellidos: '',
          telefono: data.phone
        }

        this._snackBar.open('CLIENTE REGISTRADO', 'OK', {
          duration: 3000,
        });

        setTimeout(() => {
          this.dialogRef.close(clienteNuevo);
        }, 3000);

      },
      error: (error) => {
        console.log('error', error);
        this._snackBar.open('ERROR', 'OK', {
          duration: 3000,
        });
      },
      complete: () => {
        console.log('complete');
      }
    })
  }

  cerrar() {
    this.dialogRef.close();
  }

}
