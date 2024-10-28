import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionConsultasComponent } from './recepcion-consultas.component';

describe('RecepcionConsultasComponent', () => {
  let component: RecepcionConsultasComponent;
  let fixture: ComponentFixture<RecepcionConsultasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionConsultasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecepcionConsultasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
