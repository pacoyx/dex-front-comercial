import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionRetirarComponent } from './recepcion-retirar.component';

describe('RecepcionRetirarComponent', () => {
  let component: RecepcionRetirarComponent;
  let fixture: ComponentFixture<RecepcionRetirarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionRetirarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecepcionRetirarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
