import { Injectable, ElementRef } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { Shape, State, EditState } from "./shapes/shape";
import { Point } from "./shapes/point";
import { ShapeFactory } from "./shapes/shape-factory";
import { ShapeEventService } from "./shape-event.service";

@Injectable({
  providedIn: "root",
})
export class MouseService {
  constructor(private shapeEventService: ShapeEventService) {}

  down(event, point: Point) {
    if (event.target.hasAttributeNS(null, "secundary")) {
      this.shapeEventService.shape.beginEdit(
        Number(event.target.getAttributeNS(null, "state"))
      );
    } else if (
      this.shapeEventService.isSelectShape ||
      !this.shapeEventService.shape
    ) {
      this.shapeEventService.resetChanges();
      this.shapeEventService.shape = ShapeFactory.getShape(
        event.target.tagName,
        event.target
      );
    } else {
      this.shapeEventService.beginCreate(event, point);
    }
  }

  up(event, point: Point) {
    if (!this.shapeEventService.shape) return;
    this.shapeEventService.finishEdit(event, point);
  }

  click(event, point: Point) {}

  move(event, point: Point) {
    if (
      !this.shapeEventService.shape ||
      this.shapeEventService.shape.state != State.EDIT
    )
      return;
    this.shapeEventService.addPoint(event, point);
  }
}
