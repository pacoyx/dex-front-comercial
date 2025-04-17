import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToggleStoreServiceService {


/*
  ESTE TOGGLE ES PARA MANEJAR EL ESTADO VISIBLE DEL BOTON CON ICON DE MENU  
*/

  // BehaviorSubject para almacenar el estado del toggle
  private toggleState = new BehaviorSubject<boolean>(false);

  // Observable para exponer el estado del toggle
  toggleState$: Observable<boolean> = this.toggleState.asObservable();

  // Método para cambiar el estado del toggle
  toggle(): void {
    this.toggleState.next(!this.toggleState.value);
  }

  // Método para establecer un estado específico
  setToggleState(state: boolean): void {
    this.toggleState.next(state);
  }

  constructor() { }

}
