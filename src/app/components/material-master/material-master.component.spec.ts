import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialMasterComponent } from './material-master.component';

describe('MaterialMasterComponent', () => {
  let component: MaterialMasterComponent;
  let fixture: ComponentFixture<MaterialMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
