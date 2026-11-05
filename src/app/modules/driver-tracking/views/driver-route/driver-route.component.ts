import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import * as L from 'leaflet';
import 'leaflet-polylinedecorator';
import { CustomDateAdapter } from '../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../core/configGlobal/custom-date-formats';
import { DriverTrackingService } from '../../services/driver-tracking.service';
import { IDriverLookup, IDriverRouteResponse } from '../../interfaces/IDriverLocation';

interface RouteLegendItem {
  employeeId: number;
  employeeName: string;
  color: string;
  points: number;
}

@Component({
  selector: 'app-driver-route',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatDatepickerModule, MatCheckboxModule, DatePipe,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './driver-route.component.html',
  styleUrl: './driver-route.component.scss'
})
export class DriverRouteComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly trackingService = inject(DriverTrackingService);
  private readonly fb = inject(FormBuilder);

  private map?: L.Map;
  private routeLayer?: L.LayerGroup;

  // Se repite si hay mas choferes que colores en la paleta.
  private static readonly COLOR_PALETTE = [
    '#1565c0', '#e65100', '#6a1b9a', '#2e7d32', '#ad1457', '#00838f', '#f9a825', '#4527a0',
  ];

  // Lima, Peru como centro por defecto mientras no se haya buscado ningun recorrido.
  private static readonly DEFAULT_CENTER: L.LatLngTuple = [-12.0464, -77.0428];

  drivers: IDriverLookup[] = [];
  routes: IDriverRouteResponse[] = [];
  legend: RouteLegendItem[] = [];
  loading = false;
  searched = false;

  readonly filtroForm = this.fb.group({
    todos: [true],
    employeeIds: [[] as number[]],
    fecha: [new Date(), Validators.required],
    horaInicio: [''],
    horaFin: [''],
  });

  ngOnInit(): void {
    this.trackingService.getDrivers().subscribe({
      next: (resp) => { this.drivers = resp.data; },
      error: (err) => console.error('No se pudo cargar la lista de choferes:', err),
    });

    this.filtroForm.get('todos')?.valueChanges.subscribe((todos) => {
      const control = this.filtroForm.get('employeeIds');
      if (todos) {
        control?.disable();
      } else {
        control?.enable();
      }
    });
    this.filtroForm.get('employeeIds')?.disable();
  }

  ngAfterViewInit(): void {
    this.map = L.map('driver-route-map').setView(DriverRouteComponent.DEFAULT_CENTER, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  buscar(): void {
    const { todos, employeeIds, fecha, horaInicio, horaFin } = this.filtroForm.getRawValue();
    if (!fecha || (!todos && (!employeeIds || employeeIds.length === 0))) {
      return;
    }

    this.loading = true;
    this.searched = true;

    this.trackingService.getRoute(todos ? [] : (employeeIds ?? []), this.formatFecha(fecha), horaInicio || undefined, horaFin || undefined).subscribe({
      next: (resp) => {
        this.loading = false;
        this.routes = resp.data;
        this.dibujarRecorrido();
      },
      error: (err) => {
        this.loading = false;
        this.routes = [];
        this.legend = [];
        console.error('No se pudo obtener el recorrido:', err);
      }
    });
  }

  // yyyy-MM-dd en hora local (NO toISOString: convierte a UTC y puede correr el dia).
  private formatFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private dibujarRecorrido(): void {
    if (!this.map) {
      return;
    }

    this.routeLayer?.remove();
    this.routeLayer = L.layerGroup().addTo(this.map);
    this.legend = [];

    const allBounds: L.LatLngTuple[] = [];

    this.routes.forEach((route, index) => {
      if (route.points.length === 0 || !this.routeLayer) {
        return;
      }

      const color = DriverRouteComponent.COLOR_PALETTE[index % DriverRouteComponent.COLOR_PALETTE.length];
      this.legend.push({ employeeId: route.employeeId, employeeName: route.employeeName, color, points: route.points.length });

      const latlngs: L.LatLngTuple[] = route.points.map((p) => [p.latitude, p.longitude]);
      allBounds.push(...latlngs);

      const polyline = L.polyline(latlngs, { color, weight: 4 }).addTo(this.routeLayer);

      // Flechas repetidas a lo largo de la linea para distinguir el sentido del recorrido
      // (ida vs vuelta), aunque la ruta se superponga sobre si misma.
      L.polylineDecorator(polyline, {
        patterns: [
          {
            offset: '5%',
            repeat: '8%',
            symbol: L.Symbol.arrowHead({
              pixelSize: 12,
              polygon: false,
              pathOptions: { color, weight: 2 },
            }),
          },
        ],
      }).addTo(this.routeLayer);

      const inicio = route.points[0];
      const fin = route.points[route.points.length - 1];

      L.circleMarker([inicio.latitude, inicio.longitude], {
        radius: 8, color: '#2e7d32', fillColor: '#2e7d32', fillOpacity: 1,
      })
        .bindPopup(`${route.employeeName} — Inicio: ${new Date(inicio.recordedAt).toLocaleTimeString('es-PE')}`)
        .addTo(this.routeLayer);

      L.circleMarker([fin.latitude, fin.longitude], {
        radius: 8, color: '#c62828', fillColor: '#c62828', fillOpacity: 1,
      })
        .bindPopup(`${route.employeeName} — Fin: ${new Date(fin.recordedAt).toLocaleTimeString('es-PE')}`)
        .addTo(this.routeLayer);
    });

    if (allBounds.length > 0) {
      this.map.fitBounds(L.latLngBounds(allBounds).pad(0.2));
    }
  }
}
