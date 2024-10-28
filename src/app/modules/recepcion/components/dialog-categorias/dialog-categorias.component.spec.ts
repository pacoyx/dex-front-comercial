import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCategoriasComponent } from './dialog-categorias.component';

describe('DialogCategoriasComponent', () => {
  let component: DialogCategoriasComponent;
  let fixture: ComponentFixture<DialogCategoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCategoriasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
