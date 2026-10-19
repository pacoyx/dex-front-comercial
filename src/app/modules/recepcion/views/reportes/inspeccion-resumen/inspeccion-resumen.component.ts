import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { InspeccionService } from '../../../services/inspeccion.service';
import { EmisionService } from '../../../services/emision.service';
import { InspectionSummaryResponse, WorkGuidePhotoResponse } from '../../../interfaces/IInspeccion';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { DialogVerFotosComponent } from './components/dialog-ver-fotos/dialog-ver-fotos.component';

@Component({
  selector: 'app-inspeccion-resumen',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatIconModule, MatChipsModule, MatCardModule, LoadingComponent
  ],
  templateUrl: './inspeccion-resumen.component.html',
  styleUrl: './inspeccion-resumen.component.css'
})
export class InspeccionResumenComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private inspeccionService = inject(InspeccionService);
  private emisionService = inject(EmisionService);
  private dialog = inject(MatDialog);

  serieGuia = '';
  numeroGuia = '';
  private workGuideId: number | null = null;
  resumen: InspectionSummaryResponse | null = null;
  fotos: WorkGuidePhotoResponse[] = [];
  fotoUrls = new Map<number, string>();

  cargando = false;
  cargandoFotos = false;
  errorMessage = '';
  fotosCargadas = false;

  ngOnInit(): void {
    const serie = this.route.snapshot.params['serie'];
    const numGuia = this.route.snapshot.params['numGuia'];
    if (serie && numGuia) {
      this.serieGuia = serie;
      this.numeroGuia = numGuia;
      this.buscar();
    }
  }

  buscar(): void {
    if (!this.serieGuia || !this.numeroGuia) return;

    this.errorMessage = '';
    this.resumen = null;
    this.fotos = [];
    this.fotosCargadas = false;
    this.cargando = true;

    this.emisionService.ObtenerGuiaPorDocumento(this.serieGuia, this.numeroGuia).subscribe({
      next: (resp) => {
        if (!resp.success || !resp.data) {
          this.cargando = false;
          this.errorMessage = 'No se encontró la guía de trabajo.';
          return;
        }
        this.workGuideId = resp.data.id;
        this.cargarResumen();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMessage = extractErrorMessage(err, 'No se encontró la guía de trabajo.');
      }
    });
  }

  private cargarResumen(): void {
    if (!this.workGuideId) return;

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
        this.cargarMiniaturas();
      },
      error: (err) => {
        this.cargandoFotos = false;
        this.errorMessage = extractErrorMessage(err, 'No se pudo cargar las fotos de la guía.');
      }
    });
  }

  private cargarMiniaturas(): void {
    this.liberarFotoUrls();
    this.fotos.forEach((foto) => {
      this.inspeccionService.descargarFotoGuia(foto.id).subscribe({
        next: (blob) => this.fotoUrls.set(foto.id, URL.createObjectURL(blob)),
        error: () => { /* si falla una miniatura, simplemente no se muestra */ }
      });
    });
  }

  abrirFoto(index: number): void {
    this.dialog.open(DialogVerFotosComponent, {
      width: '440px',
      maxWidth: '95vw',
      data: {
        fotos: this.fotos,
        fotoUrls: this.fotoUrls,
        startIndex: index
      }
    });
  }

  private liberarFotoUrls(): void {
    this.fotoUrls.forEach((url) => URL.revokeObjectURL(url));
    this.fotoUrls.clear();
  }

  ngOnDestroy(): void {
    this.liberarFotoUrls();
  }
}
