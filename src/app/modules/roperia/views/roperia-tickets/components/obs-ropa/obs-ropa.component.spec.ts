import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObsRopaComponent } from './obs-ropa.component';

describe('ObsRopaComponent', () => {
  let component: ObsRopaComponent;
  let fixture: ComponentFixture<ObsRopaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObsRopaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObsRopaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
