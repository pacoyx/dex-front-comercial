import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogClienteComponent } from './dialog-cliente.component';

describe('DialogClienteComponent', () => {
  let component: DialogClienteComponent;
  let fixture: ComponentFixture<DialogClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogClienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
