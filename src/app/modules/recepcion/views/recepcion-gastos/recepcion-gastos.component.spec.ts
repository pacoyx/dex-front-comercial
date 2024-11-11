import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionGastosComponent } from './recepcion-gastos.component';

describe('RecepcionGastosComponent', () => {
  let component: RecepcionGastosComponent;
  let fixture: ComponentFixture<RecepcionGastosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionGastosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecepcionGastosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
