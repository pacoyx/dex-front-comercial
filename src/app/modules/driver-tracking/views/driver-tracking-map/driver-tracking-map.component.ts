import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { DriverTrackingService } from '../../services/driver-tracking.service';
import { IDriverLocation, IDriverLookup } from '../../interfaces/IDriverLocation';

// Iconos del marker servidos desde assets locales (no desde un CDN externo) para que el mapa
// no dependa de internet de terceros para mostrarse -solo los tiles de OpenStreetMap si.
L.Icon.Default.mergeOptions({
  iconUrl: 'assets/leaflet/marker-icon.png',
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-driver-tracking-map',
  standalone: true,
  imports: [
    RouterModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatSelectModule, MatCheckboxModule,
  ],
  templateUrl: './driver-tracking-map.component.html',
  styleUrl: './driver-tracking-map.component.scss'
})
export class DriverTrackingMapComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly trackingService = inject(DriverTrackingService);
  private readonly fb = inject(FormBuilder);

  private map?: L.Map;
  private readonly markers = new Map<number, L.Marker>();
  private subscription?: Subscription;

  // Lima, Peru como centro por defecto mientras no haya ninguna posicion todavia.
  private static readonly DEFAULT_CENTER: L.LatLngTuple = [-12.0464, -77.0428];

  drivers: IDriverLookup[] = [];

  readonly filtroForm = this.fb.group({
    todos: [true],
    employeeIds: [[] as number[]],
  });

  ngOnInit(): void {
    this.trackingService.getDrivers().subscribe({
      next: (resp) => { this.drivers = resp.data; },
      error: (err) => console.error('No se pudo cargar la lista de choferes:', err),
    });

    this.filtroForm.get('employeeIds')?.disable();

    this.filtroForm.get('todos')?.valueChanges.subscribe((todos) => {
      const control = this.filtroForm.get('employeeIds');
      if (todos) {
        control?.disable();
      } else {
        control?.enable();
      }
      this.refrescarMarcadores();
      this.fitToMarkers();
    });

    this.filtroForm.get('employeeIds')?.valueChanges.subscribe(() => {
      this.refrescarMarcadores();
      this.fitToMarkers();
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map('driver-tracking-map').setView(DriverTrackingMapComponent.DEFAULT_CENTER, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.trackingService.getInitialLocations().subscribe({
      next: (resp) => {
        this.trackingService.setInitialLocations(resp.data);
        this.refrescarMarcadores();
        this.fitToMarkers();
      },
      error: (err) => console.error('No se pudo cargar la ubicación de los choferes:', err),
    });

    this.trackingService.connect();

    this.subscription = this.trackingService.locations$.subscribe((locations) => {
      locations.forEach((location) => this.upsertMarkerSiVisible(location));
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.trackingService.disconnect();
    this.map?.remove();
  }

  private estaVisible(employeeId: number): boolean {
    const { todos, employeeIds } = this.filtroForm.getRawValue();
    return !!todos || (employeeIds ?? []).includes(employeeId);
  }

  // Vuelve a aplicar el filtro sobre TODAS las ubicaciones conocidas (no solo la ultima que
  // cambio), necesario porque cambiar el filtro no dispara un evento nuevo del hub.
  private refrescarMarcadores(): void {
    this.trackingService.locations$.value.forEach((location) => this.upsertMarkerSiVisible(location));
  }

  private upsertMarkerSiVisible(location: IDriverLocation): void {
    if (!this.estaVisible(location.employeeId)) {
      this.removeMarker(location.employeeId);
      return;
    }
    this.upsertMarker(location);
  }

  private removeMarker(employeeId: number): void {
    const marker = this.markers.get(employeeId);
    if (marker) {
      marker.remove();
      this.markers.delete(employeeId);
    }
  }

  private upsertMarker(location: IDriverLocation): void {
    if (!this.map) {
      return;
    }

    const latLng: L.LatLngTuple = [location.latitude, location.longitude];
    const popupText = `<b>${location.employeeName}</b><br>Última actualización: ${new Date(location.recordedAt).toLocaleTimeString('es-PE')}`;

    const existing = this.markers.get(location.employeeId);
    if (existing) {
      existing.setLatLng(latLng).setPopupContent(popupText);
      return;
    }

    const marker = L.marker(latLng).addTo(this.map).bindPopup(popupText);
    this.markers.set(location.employeeId, marker);
  }

  private fitToMarkers(): void {
    if (!this.map || this.markers.size === 0) {
      return;
    }

    const group = L.featureGroup(Array.from(this.markers.values()));
    this.map.fitBounds(group.getBounds().pad(0.2));
  }
}
