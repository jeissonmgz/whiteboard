import { Shape, State, TypeShape, EditState } from "./shape";
import { Point } from "./point";
import { ElementRef } from "@angular/core";
import { ShapeButton } from "./controls/shape-button";
import { CenterButton } from "./controls/center-button";

export class Line extends Shape {
  initPoint: Point;
  constructor(element = null) {
    super(element, TypeShape.LINE);
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
  editPoint(point: Point): void {
    let difference = point.differenceRelative(this.initPoint);
    this.initPoint = point.clone();
    switch (this.editState) {
      case EditState.CENTER:
        this.x1 += difference.x;
        this.y1 += difference.y;
        this.x2 += difference.x;
        this.y2 += difference.y;
        break;
      case EditState.FIRST_POINT:
        this.x1 = point.x;
        this.y1 = point.y;
        break;
      default:
        this.x2 = point.x;
        this.y2 = point.y;
        break;
    }
  }
  lastPoint(point: Point, duration: number) {}
  beginEdit(stateEdit: EditState) {
    super.beginEdit(stateEdit);
    this.initPoint = new Point(
      (this.x1 + this.x2) / 2,
      (this.y1 + this.y2) / 2
    );
  }
  generateControlsEdit(): ShapeButton[] {
    this.controlsEdit = [
      new CenterButton(this.x1, this.y1, EditState.FIRST_POINT, this, "move"),
      new CenterButton(this.x2, this.y2, EditState.DEFAULT, this, "move"),
      new CenterButton(
        (this.x1 + this.x2) / 2,
        (this.y1 + this.y2) / 2,
        EditState.CENTER,
        this,
        "move"
      ),
    ];
    return this.controlsEdit;
  }
}
