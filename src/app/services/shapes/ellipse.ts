import { Shape, State, TypeShape } from "./shape";
import { ElementRef } from "@angular/core";
import { Point } from "./point";

export class Ellipse extends Shape {
  constructor(element = null) {
    super(element, TypeShape.ELLIPSE);
  }
  set cx(cx: number) {
    this.element.setAttributeNS(null, "cx", cx.toString());
  }
  get cx() {
    return Number(this.element.getAttributeNS(null, "cx"));
  }

  set cy(cy: number) {
    this.element.setAttributeNS(null, "cy", cy.toString());
  }
  get cy() {
    return Number(this.element.getAttributeNS(null, "cy"));
  }

  set rx(rx: number) {
    this.element.setAttributeNS(null, "rx", rx.toString());
  }
  get rx() {
    return Number(this.element.getAttributeNS(null, "rx"));
  }

  set ry(ry: number) {
    this.element.setAttributeNS(null, "ry", ry.toString());
  }
  get ry() {
    return Number(this.element.getAttributeNS(null, "ry"));
  }
  firstPoint(point: Point): ElementRef {
    this.cx = point.x;
    this.cy = point.y;
    this.rx = 0;
    this.ry = 0;
    this.state = State.EDIT;
    return this.element;
  }
  addPoint(point: Point): void {
    let difference = point.difference(new Point(this.cx, this.cy));
    this.rx = difference.x;
    this.ry = difference.y;
  }
  lastPoint(point: Point, duration: number) {}
}
