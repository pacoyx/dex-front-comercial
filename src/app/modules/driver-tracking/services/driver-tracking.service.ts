import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginService } from '../../../core/services/login.service';
import { IDriverLocation } from '../interfaces/IDriverLocation';

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
}
