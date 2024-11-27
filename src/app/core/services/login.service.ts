import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ILoginResponse, ILoginResponseData } from '../interfaces/ILoginResponse';
import { ILoginRequest } from '../interfaces/ILoginRequest';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { IRefreshTokenRequest } from '../interfaces/IRefreshTokenRequest';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<ILoginResponse> {
    const body: ILoginRequest = { username, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ILoginResponse>(this.apiUrl + environment.EPlogin, body, { headers });
  }

  getLoginData(): ILoginResponseData | null {
    const storedData = localStorage.getItem('dex24Auth');
    if (storedData == null) {
      console.log('No se encontraron datos de inicio de sesion.');
      return null;
    }
    const parsedData: ILoginResponseData = JSON.parse(storedData);
    return parsedData;
  }

  refreshToken(): Observable<any> {


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

    return this.http.post<any>(this.apiUrl + environment.EPRefreshToken, requestRefresh, { headers }).pipe(
      tap((response) => {
        objToken.token = response.token;
        objToken.refreshToken = response.refreshToken;
         localStorage.setItem('dex24Auth', JSON.stringify(objToken));
         console.log('Refresh token success');
         console.log('localStorage actualizado');        
        
      })
    );
  }

}
