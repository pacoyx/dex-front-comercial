import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginService } from '../../../core/services/login.service';
import { IDriverLocation, IDriverLookup, IDriverRouteResponse } from '../interfaces/IDriverLocation';

@Injectable({ providedIn: 'root' })
export class DriverTrackingService {
  private readonly http = inject(HttpClient);
  private readonly loginService = inject(LoginService);
  private hubConnection?: signalR.HubConnection;

  // Mapa por employeeId: cada evento nuevo del hub reemplaza solo la entrada de ese chofer.
  readonly locations$ = new BehaviorSubject<Map<number, IDriverLocation>>(new Map());

  getInitialLocations(): Observable<{ data: IDriverLocation[] }> {
    return this.http.get<{ data: IDriverLocation[] }>(`${environment.apiUrlBase}api/driver-tracking/locations`);
  }

  setInitialLocations(locations: IDriverLocation[]): void {
    const map = new Map<number, IDriverLocation>();
    locations.forEach((l) => map.set(l.employeeId, l));
    this.locations$.next(map);
  }

  connect(): void {
    if (this.hubConnection) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrlBase}driverTrackingHub`, {
        accessTokenFactory: () => this.loginService.getLoginData()?.token ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('DriverLocationUpdated', (location: IDriverLocation) => {
      const current = new Map(this.locations$.value);
      current.set(location.employeeId, location);
      this.locations$.next(current);
    });

    this.hubConnection.start().catch((err) => console.error('No se pudo conectar al hub de seguimiento de choferes:', err));
  }

  disconnect(): void {
    this.hubConnection?.stop();
    this.hubConnection = undefined;
  }

  getDrivers(): Observable<{ data: IDriverLookup[] }> {
    return this.http.get<{ data: IDriverLookup[] }>(`${environment.apiUrlBase}api/driver-tracking/drivers`);
  }

  // employeeIds vacio o no enviado = todos los choferes con registros en el rango.
  getRoute(employeeIds: number[], date: string, startTime?: string, endTime?: string): Observable<{ data: IDriverRouteResponse[] }> {
    let params = new HttpParams().set('date', date);
    employeeIds.forEach((id) => {
      params = params.append('employeeId', id);
    });
    if (startTime) {
      params = params.set('startTime', startTime);
    }
    if (endTime) {
      params = params.set('endTime', endTime);
    }

    return this.http.get<{ data: IDriverRouteResponse[] }>(`${environment.apiUrlBase}api/driver-tracking/route`, { params });
  }
}
