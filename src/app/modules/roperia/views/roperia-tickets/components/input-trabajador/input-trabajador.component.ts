import { Component, inject, OnDestroy, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RoperiaService } from '../../../../services/roperia.service';
import { FindClothingWorkerReqDto } from '../../../../interfaces/ClothingWorker';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-input-trabajador',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './input-trabajador.component.html',
  styleUrl: './input-trabajador.component.css'
})
export class InputTrabajadorComponent implements OnDestroy {

  workerEvent= output<number>();




  idText: string = '43619045';
  nameText: string = '';

  roperiaService = inject(RoperiaService);

  workerSubscription!: Subscription;

  ngOnDestroy(): void {
    if (this.workerSubscription) {
      this.workerSubscription.unsubscribe();
    }
  }

  searchTrabajador() {
    console.log('Buscando trabajador: ', this.idText);

    let req: FindClothingWorkerReqDto = {
      idWorker: this.idText,
      userRef: 1
    }

    this.workerSubscription = this.roperiaService.getTrabajadirPorIdDni(req).subscribe({
      next: (response) => {
        console.log('Response: ', response);
        if (!response.success) {
          this.nameText = 'No se encontró el trabajador';
        }
        this.nameText = response.data.name + ' ' + response.data.lastName;
        this.workerEvent.emit(response.data.id);
      },
      error: (error) => {
        console.error('Error: ', error);
      }
    });
  }

}
