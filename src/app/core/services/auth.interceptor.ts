import { HttpInterceptorFn } from '@angular/common/http';
import { throwError, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { ILoginResponseData } from '../interfaces/ILoginResponse';
import { LoginService } from './login.service';


const MAX_REFRESH_ATTEMPTS = 5;
let refreshAttempts = 0;

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // console.log('authInterceptor go go go');

  const router = inject(Router);
  const authService = inject(LoginService);
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

  // return next(authReq).pipe(
  //   catchError((error) => {
  //     if (error.status === 401) {        
  //       router.navigate(['/login']);
  //     }
  //     // console.log('error interceptor ==>', error.error);      
  //     // return throwError(() => new Error(JSON.stringify(error.error)));

  //     return throwError(() => new Error(error.error));
  //   })
  // );


  return next(authReq).pipe(
    catchError((error) => {
       console.log('error interceptor crudo ==>', error);
       console.log('error interceptor ==>', error.error);
       console.log('error interceptor status ==>', error.status);

      if (error.status === 401) {

        if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
          console.log('***M*** Maximum refresh attempts exceeded');
          
          router.navigate(['/login']);
          return throwError(() => new Error('Maximum refresh attempts exceeded'));
        }
        refreshAttempts++;


        return authService.refreshToken().pipe(
          switchMap((newAuthData) => {
             console.log( 'newAuthData ==>', newAuthData);

            const newAuthReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAuthData.token}`
              }
            });
            return next(newAuthReq);
          }),
          catchError((refreshError) => {
            router.navigate(['/login']);
            return throwError(() => new Error(refreshError.error));
          })
        );
      }
      return throwError(() => new Error(error.error));
    })
  );

};
