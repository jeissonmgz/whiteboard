import { Shape, State } from "./shape";
import { Point } from "./point";
import { ElementRef } from "@angular/core";

export class Rect extends Shape {
  initPoint: Point;
  constructor(element = null) {
    super(element, "rect");
  }
  set x(x: number) {
    this.element.setAttributeNS(null, "x", x.toString());
  }
  get x() {
    return Number(this.element.getAttributeNS(null, "x"));
  }

  set y(y: number) {
    this.element.setAttributeNS(null, "y", y.toString());
  }
  get y() {
    return Number(this.element.getAttributeNS(null, "y"));
  }

  set width(width: number) {
    this.element.setAttributeNS(null, "width", width.toString());
  }
  get width() {
    return Number(this.element.getAttributeNS(null, "width"));
  }

  set height(height: number) {
    this.element.setAttributeNS(null, "height", height.toString());
  }
  get height() {
    return Number(this.element.getAttribPolylineuteNS(null, "height"));
  }
  firstPoint(point: Point): ElementRef {
    this.x = point.x;
    this.y = point.y;
    this.width = 0;
    this.height = 0;
    this.initPoint = point.clone();
    this.state = State.EDIT;
    return this.element;
  }
  addPoint(point: Point): void {
    let difference = point.difference(
      new Point(this.initPoint.x, this.initPoint.y)
    );
    this.x = Math.min(this.initPoint.x, point.x);
    this.y = Math.min(this.initPoint.y, point.y);
    this.width = difference.x;
    this.height = difference.y;
  }
  lastPoint(point: Point, duration: number) {}
}
