import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TailorReportComponent } from './tailor-report.component';

describe('TailorReportComponent', () => {
  let component: TailorReportComponent;
  let fixture: ComponentFixture<TailorReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TailorReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TailorReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
