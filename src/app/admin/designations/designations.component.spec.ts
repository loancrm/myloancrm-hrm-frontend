import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignationsComponent } from './designations.component';

describe('DesignationsComponent', () => {
  let component: DesignationsComponent;
  let fixture: ComponentFixture<DesignationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DesignationsComponent]
    });
    fixture = TestBed.createComponent(DesignationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
