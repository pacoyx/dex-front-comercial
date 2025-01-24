import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDividirPagoComponent } from './dialog-dividir-pago.component';

describe('DialogDividirPagoComponent', () => {
  let component: DialogDividirPagoComponent;
  let fixture: ComponentFixture<DialogDividirPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogDividirPagoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogDividirPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
