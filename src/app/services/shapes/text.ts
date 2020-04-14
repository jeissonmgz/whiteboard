import { Shape, State, TypeShape, EditState } from "./shape";
import { Point } from "./point";
import { ElementRef } from "@angular/core";
import { ShapeButton } from "./controls/shape-button";
import { ContainerButton } from "./controls/container-button";

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
    switch (this.editState) {
      case EditState.CENTER:
        this.x = point.x - this.width / 2;
        this.y = point.y - this.height / 2;
        break;
      case EditState.W_POINT:
      case EditState.E_POINT:
        this.x = Math.min(this.initPoint.x, point.x);
        this.width = difference.x;
        break;
      case EditState.N_POINT:
      case EditState.S_POINT:
        this.y = Math.min(this.initPoint.y, point.y);
        this.height = difference.y;
        break;
      default:
        this.x = Math.min(this.initPoint.x, point.x);
        this.y = Math.min(this.initPoint.y, point.y);
        this.width = difference.x;
        this.height = difference.y;
        break;
    }
    this.focus();
  }
  beginEdit(stateEdit: EditState) {
    super.beginEdit(stateEdit);
    switch (this.editState) {
      case EditState.CENTER:
      case EditState.N_POINT:
      case EditState.NW_POINT:
      case EditState.W_POINT:
        this.initPoint = new Point(this.x + this.width, this.y + this.height);
        break;
      case EditState.S_POINT:
      case EditState.SE_POINT:
      case EditState.E_POINT:
        this.initPoint = new Point(this.x, this.y);
        break;
      case EditState.NE_POINT:
        this.initPoint = new Point(this.x, this.y + this.height);
        break;
      case EditState.SW_POINT:
        this.initPoint = new Point(this.x + this.width, this.y);
        break;
    }
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
    this.controlsEdit = [];
    let container = new ContainerButton(
      this.x,
      this.y,
      this.width,
      this.height,
      this,
      EditState.CENTER
    );
    this.controlsEdit = this.controlsEdit.concat(
      container.generateCornersAndSide
    );
    return this.controlsEdit;
  }
}
