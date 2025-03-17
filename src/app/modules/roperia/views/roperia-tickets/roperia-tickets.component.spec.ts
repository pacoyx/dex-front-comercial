import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoperiaTicketsComponent } from './roperia-tickets.component';

describe('RoperiaTicketsComponent', () => {
  let component: RoperiaTicketsComponent;
  let fixture: ComponentFixture<RoperiaTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoperiaTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoperiaTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
