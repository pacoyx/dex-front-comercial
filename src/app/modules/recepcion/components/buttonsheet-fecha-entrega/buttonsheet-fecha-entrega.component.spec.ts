import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonsheetFechaEntregaComponent } from './buttonsheet-fecha-entrega.component';

describe('ButtonsheetFechaEntregaComponent', () => {
  let component: ButtonsheetFechaEntregaComponent;
  let fixture: ComponentFixture<ButtonsheetFechaEntregaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonsheetFechaEntregaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonsheetFechaEntregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
