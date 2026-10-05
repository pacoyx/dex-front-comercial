import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ILoginResponse, ILoginResponseData } from '../interfaces/ILoginResponse';
import { ILoginRequest } from '../interfaces/ILoginRequest';
import { tap } from 'rxjs/operators';
import { IRefreshTokenRequest } from '../interfaces/IRefreshTokenRequest';
import { IRefreshTokenResponse } from '../interfaces/IRefreshTokenResponse';
import { ICurrentUserResponse } from '../interfaces/ICurrentUserResponse';
import { IResponseGeneric } from '../interfaces/IShared';
import { PermissionsStoreService } from './permissions-store.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = environment.apiUrlBase;
  private permissionsStore = inject(PermissionsStoreService);

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<ILoginResponse> {
    console.log('this.apiUrl==>', this.apiUrl);
    console.log('environment.EPlogin==>', environment.EPlogin);

    const body: ILoginRequest = { username, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ILoginResponse>(this.apiUrl + environment.EPlogin, body, { headers });
  }

  getLoginData(): ILoginResponseData | null {
    const storedData = localStorage.getItem('dex24Auth');      
    if (storedData == null || storedData === '') {
      console.log('No se encontraron datos de inicio de sesion.');
      return null;
    }
    const parsedData: ILoginResponseData = JSON.parse(storedData);
    return parsedData;
  }

  refreshToken(): Observable<IRefreshTokenResponse> {


    const infoUser = localStorage.getItem('dex24Auth');
    if (!infoUser) {
      return throwError(() => new Error('No refresh token available'));
    }

    let objToken = JSON.parse(infoUser);
    let requestRefresh: IRefreshTokenRequest = {
      token: objToken ? objToken.token : '',
      refreshToken: objToken ? objToken.refreshToken : ''
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<IRefreshTokenResponse>(this.apiUrl + environment.EPRefreshToken, requestRefresh, { headers }).pipe(
      tap((response) => {
        objToken.token = response.token;
        objToken.refreshToken = response.refreshToken;
        objToken.roles = response.roles;
        objToken.permissions = response.permissions;
        localStorage.setItem('dex24Auth', JSON.stringify(objToken));
        this.permissionsStore.setSession(response.roles, response.permissions);
      })
    );
  }

  obtenerUsuarioActual(): Observable<IResponseGeneric<ICurrentUserResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ICurrentUserResponse>>(this.apiUrl + environment.EPAuthMe, { headers });
  }

}
