import { NgIf, NgStyle } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { LoadingComponent } from "../loading/loading.component";
import { Subscription } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { ToggleStoreServiceService } from '../../services/toggle-store-service.service';
import { ILoginResponseData } from '../../interfaces/ILoginResponse';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule,
    MatIcon, ReactiveFormsModule, NgStyle, NgIf, LoadingComponent, MatSelectModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  router = inject(Router);
  authService = inject(LoginService);
  txtUsuario = '';
  txtPwd = '';
  screenHeight: any;
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
    this.screenHeight = window.innerHeight;
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
          this.router.navigate(['recepcion']);


        },
        error: (err) => {
          var errMsg = 'Error en el inicio de sesión';
          if (err.status === 401) {
            errMsg = 'Usuario no autorizado, verifique sus credenciales';
          }
          this.loading.set(false);
          this.mostrarerror(errMsg);
        },
        complete: () => {
          console.log('complete() => login()');
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

}
