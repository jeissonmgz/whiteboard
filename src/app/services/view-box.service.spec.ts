import { TestBed } from "@angular/core/testing";

import { ViewBoxService } from "./view-box.service";

describe("ViewBoxService", () => {
  let service: ViewBoxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewBoxService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
