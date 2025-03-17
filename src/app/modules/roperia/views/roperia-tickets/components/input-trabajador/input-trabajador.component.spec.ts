import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTrabajadorComponent } from './input-trabajador.component';

describe('InputTrabajadorComponent', () => {
  let component: InputTrabajadorComponent;
  let fixture: ComponentFixture<InputTrabajadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTrabajadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputTrabajadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
