import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogFormRegMovimientoComponent } from './dialog-form-reg-movimiento.component';

describe('DialogFormRegMovimientoComponent', () => {
  let component: DialogFormRegMovimientoComponent;
  let fixture: ComponentFixture<DialogFormRegMovimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogFormRegMovimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogFormRegMovimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
