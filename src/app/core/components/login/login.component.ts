import { NgIf } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { LoadingComponent } from "../loading/loading.component";
import { Subscription } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { ToggleStoreServiceService } from '../../services/toggle-store-service.service';
import { PermissionsStoreService } from '../../services/permissions-store.service';
import { ILoginResponseData } from '../../interfaces/ILoginResponse';
import { DialogAuthInfoComponent } from './components/dialog-auth-info/dialog-auth-info.component';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, FormsModule,
    MatIcon, ReactiveFormsModule, NgIf, LoadingComponent, MatSelectModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  authService = inject(LoginService);
  private permissionsStore = inject(PermissionsStoreService);
  private dialog = inject(MatDialog);
  txtUsuario = '';
  txtPwd = '';
  hide = signal(true);
  loading = signal(false);
  showError = signal(false);
  errorMessage = '';
  subscriptionLogin!: Subscription;
  // sucursales: any[] = [];
  // selectedSucursal = 0;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    if (this.subscriptionLogin) {
      this.subscriptionLogin.unsubscribe();
    }
  }

  ngOnInit(): void {
    // Aviso que deja el interceptor al forzar un logout (ej. horario de
    // acceso vencido mientras la sesion seguia activa).
    const notice = this.activatedRoute.snapshot.queryParamMap.get('notice');
    if (notice) {
      this.mostrarerror(notice);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.loading.set(true);
      this.subscriptionLogin = this.authService.login(username, password).subscribe({
        next: (response) => {
          this.loading.set(false);
          if (!response.success) {
            this.mostrarerror(response.message);
            return;
          }

          if (!response.data) {
            this.mostrarerror('Error en el inicio de sesión: no se recibió información del usuario');
            return;
          }

          if (!response.data.token) {
            this.mostrarerror('Error en el inicio de sesión: no se recibió token de autenticación');
            return;
          }

          let parsedData: ILoginResponseData = response.data;
          if (response.data.branchSales.length == 1) {
            parsedData.branchSalesCashId = response.data.branchSales[0].branchSalesId;

            // this.mostrarerror('seleccione una sucursal');
            // this.sucursales = [{ id: 0, branchSalesId: 0, branchSalesName: '[Seleccione Sucursal]' }, ...response.data.branchSales];
            // this.loading.set(false);
          }

          localStorage.setItem('dex24Auth', JSON.stringify(parsedData));
          this.permissionsStore.setSession(parsedData.roles, parsedData.permissions);
          this.router.navigate(['recepcion']);


        },
        error: (err) => {
          var errMsg = 'Error en el inicio de sesión';
          if (err.status === 401) {
            errMsg = 'Usuario no autorizado, verifique sus credenciales';
          } else if (err.status === 403 && err.error?.message) {
            // Caso horario de acceso (u otro 403 con mensaje propio del backend):
            // se muestra tal cual en vez del error generico de credenciales.
            errMsg = err.error.message;
          }
          this.loading.set(false);
          this.mostrarerror(errMsg);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
    }
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  login() {
    this.router.navigate(['recepcion']);
  }

  mostrarerror(msjErr: string) {
    this.showError.set(true);
    this.errorMessage = msjErr;
    setTimeout(() => {
      this.showError.set(false);
    }, 3000);
  }

  applyFilterSucursal(event: any) {

  }

  olvideContrasena(event: Event): void {
    event.preventDefault();
    this.dialog.open(DialogAuthInfoComponent, {
      width: '420px',
      data: {
        icon: 'lock_reset',
        title: 'Recuperar Contraseña',
        message: 'Por seguridad, el restablecimiento de contraseña lo realiza un administrador del sistema. Comunícate con el administrador de tu sucursal o empresa para que te ayude a recuperar el acceso.',
      },
    });
  }

  solicitarAcceso(event: Event): void {
    event.preventDefault();
    this.dialog.open(DialogAuthInfoComponent, {
      width: '420px',
      data: {
        icon: 'person_add',
        title: 'Solicitar Acceso',
        message: 'Las cuentas de acceso al sistema son creadas por un administrador. Comunícate con el administrador de tu empresa para solicitar la creación de tu usuario.',
      },
    });
  }

}
