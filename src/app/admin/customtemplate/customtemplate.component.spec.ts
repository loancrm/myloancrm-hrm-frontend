import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomtemplateComponent } from './customtemplate.component';

describe('CustomtemplateComponent', () => {
  let component: CustomtemplateComponent;
  let fixture: ComponentFixture<CustomtemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomtemplateComponent]
    });
    fixture = TestBed.createComponent(CustomtemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
