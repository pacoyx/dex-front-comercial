import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPesokgComponent } from './dialog-pesokg.component';

describe('DialogPesokgComponent', () => {
  let component: DialogPesokgComponent;
  let fixture: ComponentFixture<DialogPesokgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogPesokgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogPesokgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
