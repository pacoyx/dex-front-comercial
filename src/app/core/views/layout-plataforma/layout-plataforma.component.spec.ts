import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutPlataformaComponent } from './layout-plataforma.component';

describe('LayoutPlataformaComponent', () => {
  let component: LayoutPlataformaComponent;
  let fixture: ComponentFixture<LayoutPlataformaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutPlataformaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutPlataformaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
