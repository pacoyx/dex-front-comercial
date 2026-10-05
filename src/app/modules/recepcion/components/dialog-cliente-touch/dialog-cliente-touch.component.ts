import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EmisionService } from '../../services/emision.service';
import { IClienteCreate } from '../../interfaces/IClienteCreate';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import { AlertDangerComponent } from '../../../../core/components/Alerts/alert-danger/alert-danger.component';
import { AlphaKeypadComponent } from '../alpha-keypad/alpha-keypad.component';
import { IClienteBusqueda } from '../dialog-cliente/dialog-cliente.component';

type CampoCliente = 'busqueda' | 'nombre' | 'telefono';

/**
 * Version touch de DialogClienteComponent: busqueda real (en el original
 * estaba deshabilitada) + registro, todo alimentado por un teclado en
 * pantalla, pensado para abrirse a pantalla completa desde recepcion-touch.
 * Copia separada para no afectar el modal original que usa recepcion-emision.
 */
@Component({
  selector: 'app-dialog-cliente-touch',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, MatIconModule, FormsModule, ReactiveFormsModule,
    LoadingComponent, AlertDangerComponent, AlphaKeypadComponent
  ],
  templateUrl: './dialog-cliente-touch.component.html',
  styleUrl: './dialog-cliente-touch.component.css'
})
export class DialogClienteTouchComponent implements OnInit, OnDestroy {
  readonly dialogRef = inject(MatDialogRef<DialogClienteTouchComponent>);
  readonly data = inject<{ filtro: string }>(MAT_DIALOG_DATA);
  emisionService = inject(EmisionService);

  loadingSave = false;
  bolShowError = false;
  msgError = '';

  formRegistrarCliente: FormGroup;

  subscriptionRegistrar!: Subscription;
  subscriptionBuscar!: Subscription;

  // --- busqueda con teclado en pantalla ---
  vista: 'busqueda' | 'registro' = 'busqueda';
  campoActivo: CampoCliente = 'busqueda';
  filtroNombre = '';
  resultados: IClienteBusqueda[] = [];
  buscando = false;
  busquedaInput = new Subject<string>();

  constructor() {
    this.formRegistrarCliente = new FormGroup({
      nombres: new FormControl('', [Validators.required]),
      telefono: new FormControl('', [Validators.required, Validators.pattern(/^\d{9}$/)]),
    });
  }

  ngOnInit(): void {
    this.filtroNombre = this.data?.filtro ?? '';

    this.subscriptionBuscar = this.busquedaInput.pipe(
      debounceTime(300),
      switchMap((patron) => {
        if (patron.trim().length < 2) {
          this.buscando = false;
          return of(null);
        }
        return this.emisionService.filtrarClientesPorPatron(patron).pipe(
          catchError(() => of(null)),
        );
      }),
    ).subscribe((resp) => {
      this.buscando = false;
      this.resultados = resp?.data ?? [];
    });

    if (this.filtroNombre.trim().length >= 2) {
      this.disparaBusqueda();
    }
  }

  ngOnDestroy(): void {
    if (this.subscriptionRegistrar) this.subscriptionRegistrar.unsubscribe();
    if (this.subscriptionBuscar) this.subscriptionBuscar.unsubscribe();
  }

  seleccionarCampo(campo: CampoCliente): void {
    this.campoActivo = campo;
  }

  disparaBusqueda(): void {
    this.buscando = true;
    this.busquedaInput.next(this.filtroNombre);
  }

  onKeypadKey(k: string): void {
    if (this.campoActivo === 'busqueda') {
      this.filtroNombre += k;
      this.disparaBusqueda();
      return;
    }

    if (this.campoActivo === 'nombre') {
      const control = this.formRegistrarCliente.get('nombres');
      control?.setValue((control.value ?? '') + k);
      return;
    }

    // telefono: solo acepta digitos, tope 9
    if (!/\d/.test(k)) return;
    const control = this.formRegistrarCliente.get('telefono');
    const soloDigitos: string = (control?.value ?? '').replace(/\D/g, '');
    if (soloDigitos.length >= 9) return;
    control?.setValue(soloDigitos + k);
  }

  onKeypadBackspace(): void {
    if (this.campoActivo === 'busqueda') {
      this.filtroNombre = this.filtroNombre.slice(0, -1);
      this.disparaBusqueda();
      return;
    }

    const campoForm = this.campoActivo === 'nombre' ? 'nombres' : 'telefono';
    const control = this.formRegistrarCliente.get(campoForm);
    control?.setValue((control.value ?? '').slice(0, -1));
  }

  onKeypadClear(): void {
    if (this.campoActivo === 'busqueda') {
      this.filtroNombre = '';
      this.resultados = [];
      this.buscando = false;
      return;
    }

    const campoForm = this.campoActivo === 'nombre' ? 'nombres' : 'telefono';
    this.formRegistrarCliente.get(campoForm)?.setValue('');
  }

  mostrarRegistro(): void {
    this.vista = 'registro';
    this.campoActivo = 'nombre';
  }

  volverABusqueda(): void {
    this.vista = 'busqueda';
    this.campoActivo = 'busqueda';
  }

  seleccionarCliente(cliente: IClienteBusqueda): void {
    this.dialogRef.close(cliente);
  }

  registrarCliente() {
    if (this.formRegistrarCliente.invalid) {
      this.bolShowError = true;
      this.msgError = 'Debes completar el nombre y un teléfono de 9 dígitos.';
      setTimeout(() => {
        this.bolShowError = false;
      }, 3000);
      return;
    }

    const nombres: string[] = this.formRegistrarCliente.get('nombres')?.value.toLowerCase().split(' ').filter((n: string) => n.trim() !== '') || [];
    var firstName = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
    var lastName = nombres.slice(1).join(' ');

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
