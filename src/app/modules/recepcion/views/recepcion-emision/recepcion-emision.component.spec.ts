import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionEmisionComponent } from './recepcion-emision.component';

describe('RecepcionEmisionComponent', () => {
  let component: RecepcionEmisionComponent;
  let fixture: ComponentFixture<RecepcionEmisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionEmisionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecepcionEmisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
