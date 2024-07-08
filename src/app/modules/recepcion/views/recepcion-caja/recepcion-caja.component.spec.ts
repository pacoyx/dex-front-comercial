import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionCajaComponent } from './recepcion-caja.component';

describe('RecepcionCajaComponent', () => {
  let component: RecepcionCajaComponent;
  let fixture: ComponentFixture<RecepcionCajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionCajaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecepcionCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
