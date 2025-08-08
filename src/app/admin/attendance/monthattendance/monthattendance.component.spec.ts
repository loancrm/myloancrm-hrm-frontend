import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthattendanceComponent } from './monthattendance.component';

describe('MonthattendanceComponent', () => {
  let component: MonthattendanceComponent;
  let fixture: ComponentFixture<MonthattendanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonthattendanceComponent]
    });
    fixture = TestBed.createComponent(MonthattendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
