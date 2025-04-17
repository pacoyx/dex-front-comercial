import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogQuestionOneComponent } from './dialog-question-one.component';

describe('DialogQuestionOneComponent', () => {
  let component: DialogQuestionOneComponent;
  let fixture: ComponentFixture<DialogQuestionOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogQuestionOneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogQuestionOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
