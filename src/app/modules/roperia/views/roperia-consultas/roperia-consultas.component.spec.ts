import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoperiaConsultasComponent } from './roperia-consultas.component';

describe('RoperiaConsultasComponent', () => {
  let component: RoperiaConsultasComponent;
  let fixture: ComponentFixture<RoperiaConsultasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoperiaConsultasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoperiaConsultasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
