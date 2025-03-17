import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoperiaDashboardComponent } from './roperia-dashboard.component';

describe('RoperiaDashboardComponent', () => {
  let component: RoperiaDashboardComponent;
  let fixture: ComponentFixture<RoperiaDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoperiaDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoperiaDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
