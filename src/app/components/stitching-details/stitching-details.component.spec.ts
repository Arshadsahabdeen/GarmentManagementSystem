import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StitchingDetailsComponent } from './stitching-details.component';

describe('StitchingDetailsComponent', () => {
  let component: StitchingDetailsComponent;
  let fixture: ComponentFixture<StitchingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StitchingDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StitchingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
