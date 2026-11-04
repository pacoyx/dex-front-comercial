import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { DriverTrackingService } from '../../services/driver-tracking.service';
import { IDriverLocation } from '../../interfaces/IDriverLocation';

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
  imports: [],
  templateUrl: './driver-tracking-map.component.html',
  styleUrl: './driver-tracking-map.component.scss'
})
export class DriverTrackingMapComponent implements AfterViewInit, OnDestroy {
  private readonly trackingService = inject(DriverTrackingService);

  private map?: L.Map;
  private readonly markers = new Map<number, L.Marker>();
  private subscription?: Subscription;

  // Lima, Peru como centro por defecto mientras no haya ninguna posicion todavia.
  private static readonly DEFAULT_CENTER: L.LatLngTuple = [-12.0464, -77.0428];

  ngAfterViewInit(): void {
    this.map = L.map('driver-tracking-map').setView(DriverTrackingMapComponent.DEFAULT_CENTER, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.trackingService.getInitialLocations().subscribe({
      next: (resp) => {
        this.trackingService.setInitialLocations(resp.data);
        resp.data.forEach((location) => this.upsertMarker(location));
        this.fitToMarkers();
      },
      error: (err) => console.error('No se pudo cargar la ubicación de los choferes:', err),
    });

    this.trackingService.connect();

    this.subscription = this.trackingService.locations$.subscribe((locations) => {
      locations.forEach((location) => this.upsertMarker(location));
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.trackingService.disconnect();
    this.map?.remove();
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
