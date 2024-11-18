import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MntProdservicesComponent } from './mnt-prodservices.component';

describe('MntProdservicesComponent', () => {
  let component: MntProdservicesComponent;
  let fixture: ComponentFixture<MntProdservicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MntProdservicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MntProdservicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
