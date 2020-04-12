import { Shape, State, TypeShape, EditState } from "./shape";
import { ElementRef } from "@angular/core";
import { Point } from "./point";
import { Rect } from "./rect";
import { CenterButton } from "./controls/center-button";
import { ContainerButton } from "./controls/container-button";
import { ShapeButton } from "./controls/shape-button";

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
  editPoint(point: Point): void {
    let difference = point.difference(new Point(this.cx, this.cy));
    switch (this.editState) {
      case EditState.CENTER:
        this.cx = point.x;
        this.cy = point.y;
        break;
      case EditState.W_POINT:
      case EditState.E_POINT:
        this.rx = difference.x;
        break;
      case EditState.N_POINT:
      case EditState.S_POINT:
        this.ry = difference.y;
        break;
      default:
        this.rx = difference.x;
        this.ry = difference.y;
        this.rx = difference.x;
        break;
    }
  }
  lastPoint(point: Point, duration: number) {}
  generateControlsEdit(): ShapeButton[] {
    this.controlsEdit = [];
    let container = new ContainerButton(
      this.cx - this.rx,
      this.cy - this.ry,
      this.rx * 2,
      this.ry * 2,
      this,
      EditState.CENTER
    );
    this.controlsEdit = this.controlsEdit.concat(
      container.generateCornersAndSide
    );
    return this.controlsEdit;
  }
}
