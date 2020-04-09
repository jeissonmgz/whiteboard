import { Shape, State, TypeShape } from "./shape";
import { Point } from "./point";
import { ElementRef } from "@angular/core";

export class Polyline extends Shape {
  constructor(element = null) {
    super(element, TypeShape.POLYLINE);
  }
  set points(points: string) {
    this.element.setAttributeNS(null, "points", points);
  }
  get points() {
    return this.element.getAttributeNS(null, "points");
  }
  addPoint(point: Point) {
    let points = this.points == null ? "" : this.points;
    this.points = points + " " + point.x + "," + point.y;
  }
  firstPoint(point: Point): ElementRef {
    this.addPoint(point);
    this.state = State.EDIT;
    return this.element;
  }
  lastPoint(point: Point, duration: number) {}
}
