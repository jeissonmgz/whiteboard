import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CircleButtonComponent } from "./circle-button.component";

describe("ButtonComponent", () => {
  let component: CircleButtonComponent;
  let fixture: ComponentFixture<CircleButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CircleButtonComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CircleButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
