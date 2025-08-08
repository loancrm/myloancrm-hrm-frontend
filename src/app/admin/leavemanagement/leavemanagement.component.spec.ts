import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavemanagementComponent } from './leavemanagement.component';

describe('LeavemanagementComponent', () => {
  let component: LeavemanagementComponent;
  let fixture: ComponentFixture<LeavemanagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeavemanagementComponent]
    });
    fixture = TestBed.createComponent(LeavemanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
