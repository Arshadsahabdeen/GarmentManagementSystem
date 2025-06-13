import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StitchingReportComponent } from './stitching-report.component';

describe('StitchingReportComponent', () => {
  let component: StitchingReportComponent;
  let fixture: ComponentFixture<StitchingReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StitchingReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StitchingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
