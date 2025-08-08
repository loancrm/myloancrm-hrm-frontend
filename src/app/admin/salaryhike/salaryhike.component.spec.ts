import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryhikeComponent } from './salaryhike.component';

describe('SalaryhikeComponent', () => {
  let component: SalaryhikeComponent;
  let fixture: ComponentFixture<SalaryhikeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalaryhikeComponent]
    });
    fixture = TestBed.createComponent(SalaryhikeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
