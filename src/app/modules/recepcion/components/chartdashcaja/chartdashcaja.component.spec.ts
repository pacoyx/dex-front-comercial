import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartdashcajaComponent } from './chartdashcaja.component';

describe('ChartdashcajaComponent', () => {
  let component: ChartdashcajaComponent;
  let fixture: ComponentFixture<ChartdashcajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartdashcajaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartdashcajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
