import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditItemComponent } from './dialog-edit-item.component';

describe('DialogEditItemComponent', () => {
  let component: DialogEditItemComponent;
  let fixture: ComponentFixture<DialogEditItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
