import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { InspeccionService } from '../../../services/inspeccion.service';
import { InspectionSummaryResponse, WorkGuidePhotoResponse } from '../../../interfaces/IInspeccion';
import { extractErrorMessage } from '../../../shared/http-error.util';

@Component({
  selector: 'app-inspeccion-resumen',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatIconModule, MatChipsModule, LoadingComponent
  ],
  templateUrl: './inspeccion-resumen.component.html',
  styleUrl: './inspeccion-resumen.component.css'
})
export class InspeccionResumenComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private inspeccionService = inject(InspeccionService);

  workGuideId: number | null = null;
  resumen: InspectionSummaryResponse | null = null;
  fotos: WorkGuidePhotoResponse[] = [];

  cargando = false;
  cargandoFotos = false;
  errorMessage = '';
  fotosCargadas = false;

  ngOnInit(): void {
    const param = this.route.snapshot.params['workGuideId'];
    if (param) {
      this.workGuideId = parseInt(param, 10);
      this.buscar();
    }
  }

  buscar(): void {
    if (!this.workGuideId) return;

    this.errorMessage = '';
    this.resumen = null;
    this.fotos = [];
    this.fotosCargadas = false;
    this.cargando = true;

    this.inspeccionService.obtenerResumenInspeccionPorGuia(this.workGuideId).subscribe({
      next: (resp) => {
        this.cargando = false;
        this.resumen = resp.data;
      },
      error: (err) => {
        this.cargando = false;
        this.errorMessage = extractErrorMessage(err, 'No se pudo obtener el resumen de inspección de la guía.');
      }
    });
  }

  cargarFotos(): void {
    if (!this.workGuideId) return;
    this.cargandoFotos = true;
    this.inspeccionService.obtenerFotosPorGuia(this.workGuideId).subscribe({
      next: (resp) => {
        this.cargandoFotos = false;
        this.fotosCargadas = true;
        this.fotos = resp.data.photos;
      },
      error: (err) => {
        this.cargandoFotos = false;
        this.errorMessage = extractErrorMessage(err, 'No se pudo cargar las fotos de la guía.');
      }
    });
  }

  fotosDeDetalle(workGuideDetailId: number): WorkGuidePhotoResponse[] {
    return this.fotos.filter(f => f.workGuideDetailId === workGuideDetailId);
  }
}
