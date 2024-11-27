import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MaestrosService } from '../../services/maestros.service';
import { IRegistrarUbicacionRequest, IUbicacionesResponseDto } from '../../interfaces/IUbicaciones';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-recepcion-reg-ubicaciones',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatSelectModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './recepcion-reg-ubicaciones.component.html',
  styleUrl: './recepcion-reg-ubicaciones.component.css'
})
export class RecepcionRegUbicacionesComponent implements OnInit {
  maestrosService = inject(MaestrosService);
  frmUbicacion: FormGroup;
  ubicaciones: IUbicacionesResponseDto[] = [];
  bolOk: boolean = false;
  bolError: boolean = false;

  constructor() {
    this.frmUbicacion = new FormGroup({
      ubicacionId: new FormControl('', [Validators.required]),
      numeroGuia: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.cargarUbicaciones();
  }


  cargarUbicaciones() {
    this.maestrosService.obtenerUbicaciones().subscribe({
      next: (resp) => {
        this.ubicaciones = resp.data;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  registrarUbicacion() {
    if (this.frmUbicacion.valid) {
      const request: IRegistrarUbicacionRequest = {
        locationClothesId: this.frmUbicacion.get('ubicacionId')!.value,
        numeroGuia: this.frmUbicacion.get('numeroGuia')!.value,        
        comments: ''
      }
      this.maestrosService.registrarUbicacionPrenda(request).subscribe({
        next: (resp) => {
          console.log(resp);
          if(resp.success) {
            this.frmUbicacion.reset();
            this.bolOk = true;
            setTimeout(() => {
            this.bolOk = false;              
            }, 3000);
          }
        },
        error: (error) => {
          console.log(error.message);
          this.bolError = true;
          setTimeout(() => {
            this.bolError = false;              
          }, 3000);
        }
      });
    }
  }


}
