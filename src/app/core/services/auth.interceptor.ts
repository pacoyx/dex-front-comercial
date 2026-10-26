import { HttpInterceptorFn } from '@angular/common/http';
import { throwError, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { ILoginResponseData } from '../interfaces/ILoginResponse';
import { LoginService } from './login.service';
import { NotificationsSystemService } from './notifications-system.service';
import { ACCESS_SCHEDULE_BLOCKED_MESSAGE } from '../constants/access-schedule';


const MAX_REFRESH_ATTEMPTS = 5;
let refreshAttempts = 0;


const whitelistUrls = [
  '/api/prodService/getServicesQuickAccess',
];

function isWhitelisted(url: string): boolean {
  return whitelistUrls.some(whitelistedUrl => url.includes(whitelistedUrl));
}

function toClientError(status: number, body: unknown): Error & { status: number; error: unknown } {
  const err = new Error(body as string) as Error & { status: number; error: unknown };
  err.status = status;
  err.error = body;
  return err;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {


  if (isWhitelisted(req.url)) {
    return next(req);
  }
  // console.log('authInterceptor', req.url);
  

  

  const authService = inject(LoginService);
  const notificationsService = inject(NotificationsSystemService);
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

  const isLoginRequest = req.url.includes('api/login');
  const isRefreshRequest = req.url.includes('refresh-token');

  return next(authReq).pipe(
    catchError((error) => {
      console.log(req.url);

      console.log('error interceptor ==>', error.error);
      if (error.status === 403) {
        const message = error.error?.message as string | undefined;

        if (message === ACCESS_SCHEDULE_BLOCKED_MESSAGE) {
          // El login y el refresh-token manejan este mismo 403 en su propio
          // flujo (mostrar mensaje en pantalla / no reintentar); aqui solo
          // forzamos el logout cuando ocurre con una sesion ya activa.
          if (!isLoginRequest && !isRefreshRequest) {
            authService.logout(message);
          }
          return throwError(() => toClientError(error.status, error.error));
        }

        // Autenticado pero sin el permiso requerido: no es un problema de
        // token, no se reintenta refresh ni se redirige.
        if (!isLoginRequest) {
          notificationsService.showError('No tienes permiso para realizar esta acción.');
        }
        return throwError(() => toClientError(error.status, error.error));
      }

      if (error.status === 401 && !isLoginRequest) {
        if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
          console.log('***M*** Maximum refresh attempts exceeded');
          authService.logout();
          return throwError(() => new Error('Maximum refresh attempts exceeded'));
        }
        refreshAttempts++;

        return authService.refreshToken().pipe(
          switchMap((newAuthData) => {
            const newAuthReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAuthData.token}`
              }
            });
            return next(newAuthReq);
          }),
          catchError((refreshError) => {
            const refreshMessage = refreshError.error?.message as string | undefined;
            authService.logout(refreshMessage === ACCESS_SCHEDULE_BLOCKED_MESSAGE ? refreshMessage : undefined);
            return throwError(() => toClientError(refreshError.status, refreshError.error));
          })
        );
      }

      return throwError(() => toClientError(error.status, error.error));
    })
  );

};
