import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelievingletterComponent } from './relievingletter.component';

describe('RelievingletterComponent', () => {
  let component: RelievingletterComponent;
  let fixture: ComponentFixture<RelievingletterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RelievingletterComponent]
    });
    fixture = TestBed.createComponent(RelievingletterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
