import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialProcessComponent } from './material-process.component';

describe('MaterialProcessComponent', () => {
  let component: MaterialProcessComponent;
  let fixture: ComponentFixture<MaterialProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
