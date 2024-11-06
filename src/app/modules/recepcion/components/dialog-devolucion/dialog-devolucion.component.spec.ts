import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDevolucionComponent } from './dialog-devolucion.component';

describe('DialogDevolucionComponent', () => {
  let component: DialogDevolucionComponent;
  let fixture: ComponentFixture<DialogDevolucionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogDevolucionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogDevolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
