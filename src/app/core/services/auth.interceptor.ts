import { HttpInterceptorFn } from '@angular/common/http';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { ILoginResponse, ILoginResponseData } from '../interfaces/ILoginResponse';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  console.log('authInterceptor go go go');
  
  const router = inject(Router);
  const authTokenString = localStorage.getItem('dex24Auth');
  const authDataLogin: ILoginResponseData | null = authTokenString ? JSON.parse(authTokenString) : null;
  let authReq = req;

  if (authDataLogin) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authDataLogin.token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Handle unauthorized error
        router.navigate(['/login']);
      }
      // console.log('error ==>', error.error);
      
      return throwError(() => new Error(error.error));
    })
  );


};
