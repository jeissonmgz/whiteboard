import { Shape, State } from "./shape";
import { Point } from "./point";
import { ElementRef } from "@angular/core";

export class Line extends Shape {
  constructor(element = null) {
    super(element, "line");
  }
  set x1(x1: number) {
    this.element.setAttributeNS(null, "x1", x1.toString());
  }
  get x1() {
    return Number(this.element.getAttributeNS(null, "x1"));
  }

  set y1(y1: number) {
    this.element.setAttributeNS(null, "y1", y1.toString());
  }
  get y1() {
    return Number(this.element.getAttributeNS(null, "y1"));
  }

  set x2(x2: number) {
    this.element.setAttributeNS(null, "x2", x2.toString());
  }
  get x2() {
    return Number(this.element.getAttributeNS(null, "x2"));
  }

  set y2(y2: number) {
    this.element.setAttributeNS(null, "y2", y2.toString());
  }
  get y2() {
    return Number(this.element.getAttributeNS(null, "y2"));
  }
  firstPoint(point: Point): ElementRef {
    this.x1 = point.x;
    this.y1 = point.y;
    this.x2 = point.x;
    this.y2 = point.y;
    this.state = State.EDIT;
    return this.element;
  }
  addPoint(point: Point): void {
    this.x2 = point.x;
    this.y2 = point.y;
  }
  lastPoint(point: Point, duration: number) {}
}
