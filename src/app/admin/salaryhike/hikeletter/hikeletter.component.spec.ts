import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HikeletterComponent } from './hikeletter.component';

describe('HikeletterComponent', () => {
  let component: HikeletterComponent;
  let fixture: ComponentFixture<HikeletterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HikeletterComponent]
    });
    fixture = TestBed.createComponent(HikeletterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
