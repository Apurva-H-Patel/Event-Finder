import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApsearchComponent } from './apsearch.component';

describe('ApsearchComponent', () => {
  let component: ApsearchComponent;
  let fixture: ComponentFixture<ApsearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApsearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApsearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
