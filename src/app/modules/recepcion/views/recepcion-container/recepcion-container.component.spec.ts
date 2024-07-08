import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionContainerComponent } from './recepcion-container.component';

describe('RecepcionContainerComponent', () => {
  let component: RecepcionContainerComponent;
  let fixture: ComponentFixture<RecepcionContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecepcionContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
