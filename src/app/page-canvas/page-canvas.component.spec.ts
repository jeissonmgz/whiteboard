import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageCanvasComponent } from './page-canvas.component';

describe('PageCanvasComponent', () => {
  let component: PageCanvasComponent;
  let fixture: ComponentFixture<PageCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageCanvasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
