import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionRegUbicacionesComponent } from './recepcion-reg-ubicaciones.component';

describe('RecepcionRegUbicacionesComponent', () => {
  let component: RecepcionRegUbicacionesComponent;
  let fixture: ComponentFixture<RecepcionRegUbicacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionRegUbicacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecepcionRegUbicacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
