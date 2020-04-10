import { Shape, State, TypeShape } from "./shape";
import { Point } from "./point";
import { ElementRef } from "@angular/core";
import { ShapeButton } from "./controls/shape-button";

export class Text extends Shape {
  initPoint: Point;
  constructor(element = null) {
    super(element, TypeShape.TEXT);
    if (element == null) {
      this.element.innerHTML = "<div contenteditable='true'></div>";
    }
  }
  init() {
    super.init();
    this.element.innerHTML = "<div contenteditable='true'></div>";
  }
  set x(x: number) {
    this.element.setAttributeNS(null, "x", x);
  }
  get x() {
    return Number(this.element.getAttributeNS(null, "x"));
  }

  set y(y: number) {
    this.element.setAttributeNS(null, "y", y);
  }
  get y() {
    return Number(this.element.getAttributeNS(null, "y"));
  }

  set width(width: number) {
    this.element.setAttributeNS(null, "width", width);
  }
  get width() {
    return Number(this.element.getAttributeNS(null, "width"));
  }

  set height(height: number) {
    this.element.setAttributeNS(null, "height", height);
  }
  get height() {
    return Number(this.element.getAttributeNS(null, "height"));
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
  editPoint(point: Point): void {
    let difference = point.difference(
      new Point(this.initPoint.x, this.initPoint.y)
    );
    this.x = Math.min(this.initPoint.x, point.x);
    this.y = Math.min(this.initPoint.y, point.y);
    this.width = difference.x;
    this.height = difference.y;
  }
  lastPoint(point: Point, duration: number) {
    if (duration < 500) {
      this.width = 100;
      this.height = 50;
    }
  }
  focus(): void {
    this.element.firstElementChild.focus();
  }
  generateControlsEdit(): ShapeButton[] {
    return [];
  }
}
