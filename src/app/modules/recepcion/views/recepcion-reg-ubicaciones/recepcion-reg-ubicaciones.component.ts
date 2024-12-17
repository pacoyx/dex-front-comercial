import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MaestrosService } from '../../services/maestros.service';
import { IRegistrarUbicacionRequest, IRequestRegistrarUbicacion, IUbicacionesResponseDto } from '../../interfaces/IUbicaciones';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmisionService } from '../../services/emision.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';



interface Guide {
  numero: string;
  nativo: boolean;
  descripcion: string;
}

@Component({
  selector: 'app-recepcion-reg-ubicaciones',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatSelectModule,
    MatInputModule, MatFormFieldModule, ReactiveFormsModule,
    MatTableModule, MatCardModule
  ],
  templateUrl: './recepcion-reg-ubicaciones.component.html',
  styleUrl: './recepcion-reg-ubicaciones.component.css'
})
export class RecepcionRegUbicacionesComponent implements OnInit, OnDestroy {
  maestrosService = inject(MaestrosService);
  frmUbicacion: FormGroup;
  ubicaciones: IUbicacionesResponseDto[] = [];
  bolOk: boolean = false;
  bolError: boolean = false;
  listGuides: Guide[] = [];
  emisionService = inject(EmisionService);
  listGuideDetails: { numero: string, descripcion: string }[] = [];
  displayedColumnsDetails: string[] = ['guia', 'descripcion', 'acciones'];
  displayedColumns: string[] = ['mguia', 'mdescripcion', 'macciones'];
  guiasdetailsSubscription!: Subscription;
  dataSource = new MatTableDataSource<Guide>();
  bolNoExisteCliente: boolean = false;

  constructor() {
    this.frmUbicacion = new FormGroup({
      ubicacionId: new FormControl('', [Validators.required]),
      numeroGuia: new FormControl(''),
      referencia: new FormControl(''),
    });
  }
  ngOnDestroy(): void {
    if (this.guiasdetailsSubscription) this.guiasdetailsSubscription.unsubscribe();
    this.updateTable();
  }

  ngOnInit(): void {
    this.cargarUbicaciones();
  }

  updateTable() {
    this.dataSource.data = this.listGuides;
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

  agregarGuiaDetalle(numeroGuia: string, descripcion: string) {
    this.listGuides.push({ numero: numeroGuia, nativo: true, descripcion: descripcion });
    this.updateTable();
    this.listGuideDetails = [];
    setTimeout(() => {
      const inputElement = document.getElementById('numeroGuia');
      if (inputElement) {
        inputElement.focus();
      }
    }, 0);
  }

  agregarGuiaConreferencia(event: any) {
    event.preventDefault();
    this.listGuides.push({ numero: this.frmUbicacion.get('numeroGuia')!.value, nativo: false, 'descripcion': this.frmUbicacion.get('referencia')!.value });
    this.listGuides.sort((a, b) => a.numero.localeCompare(b.numero));
    this.frmUbicacion.get('numeroGuia')!.setValue('');
    this.frmUbicacion.get('referencia')!.setValue('');
    this.updateTable();
    this.bolNoExisteCliente = false;
  }


  agregarGuia(event: any) {
    event.preventDefault();

    if (this.frmUbicacion.get('numeroGuia')!.value) {
      let x = this.emisionService.ObtenerGuiaPorDocumento('001', this.frmUbicacion.get('numeroGuia')!.value).subscribe({
        next: (resp) => {
          let numeroGuia = this.frmUbicacion.get('numeroGuia')!.value;
          if (resp.data.workGuideDetailsDTO.length == 1) {
            numeroGuia = numeroGuia + 'A'
            this.listGuides.push({ numero: numeroGuia, nativo: resp.success, descripcion: resp.data.workGuideDetailsDTO[0].product.name + '' + resp.data.workGuideDetailsDTO[0].observaciones });
            this.updateTable();
          } else {
            resp.data.workGuideDetailsDTO.forEach((item) => {
              this.listGuideDetails.push({ numero: numeroGuia + item.identificador, descripcion: item.product.name + '' + item.observaciones });
            });
          }
          this.listGuides.sort((a, b) => a.numero.localeCompare(b.numero));
          this.frmUbicacion.get('numeroGuia')!.setValue('');
        },
        error: (error) => {
          console.log(error.message);
          this.bolNoExisteCliente = true;
          setTimeout(() => {
            const inputElement = document.getElementById('referencia');
            if (inputElement) {
              inputElement.focus();
            }
          }, 500);


        }
      });
    }
  }


  eliminarGuia(index: number) {
    this.listGuides.splice(index, 1);
    this.updateTable();
  }


  registrarUbicacion() {

    if(this.frmUbicacion.invalid){
      console.log('Formulario invalido');      
      return;
    }

    const reqRegUbi: IRequestRegistrarUbicacion = {
      locationClothesId: this.frmUbicacion.get('ubicacionId')!.value,
      guias: [],
      comments: ''
    };
    this.listGuides.forEach((item) => {
      reqRegUbi.guias.push({ numeroGuia: item.numero, referencia: item.descripcion, isSystem: item.nativo });
    });

    this.maestrosService.registrarUbicacionPrenda(reqRegUbi).subscribe({
      next: (resp) => {
        console.log(resp);
        if (resp.success) {
          this.frmUbicacion.reset();
          this.listGuides = [];
          this.updateTable();
          
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
