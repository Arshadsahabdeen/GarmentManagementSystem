import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TailorMasterComponent } from './tailor-master.component';

describe('TailorMasterComponent', () => {
  let component: TailorMasterComponent;
  let fixture: ComponentFixture<TailorMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TailorMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TailorMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
