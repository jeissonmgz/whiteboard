import { ElementRef } from "@angular/core";
import { Point } from "./point";
import { ShapeButton } from "./controls/shape-button";

export const SVG_NS = "http://www.w3.org/2000/svg";
export enum State {
  INIT,
  FINISH,
  EDIT,
  SHOW_EDIT,
}
export enum EditState {
  CENTER,
  N_POINT,
  S_POINT,
  E_POINT,
  W_POINT,
  NE_POINT,
  NW_POINT,
  SE_POINT,
  SW_POINT,
  FIRST_POINT,
  DEFAULT,
}
export enum TypeShape {
  ELLIPSE = "ellipse",
  LINE = "line",
  POLYLINE = "polyline",
  RECT = "rect",
  TEXT = "foreignObject",
}
export enum Behavior {
  PRIMARY,
  SECUNDARY,
}
export abstract class Shape {
  attributes: any;
  properties: any;
  state: State;
  constructor(
    public element: any,
    public name: string,
    public controlsEdit: ShapeButton[] = [],
    public editState = EditState.DEFAULT
  ) {
    if (this.element == null) {
      this.init();
    } else {
      this.state = State.SHOW_EDIT;
    }
  }
  set stroke(stroke: string) {
    this.element.setAttributeNS(null, "stroke", stroke);
  }
  get stroke() {
    return this.element.getAttributeNS(null, "stroke");
  }
  set fill(fill: string) {
    this.element.setAttributeNS(null, "fill", fill);
  }
  get fill() {
    return this.element.getAttributeNS(null, "fill");
  }
  set strokeWidth(strokeWidth: string) {
    this.element.setAttributeNS(null, "stroke-width", strokeWidth);
  }
  get strokeWidth() {
    return this.element.getAttributeNS(null, "stroke-width");
  }
  init() {
    this.removeControlsEdit();
    this.element = document.createElementNS(SVG_NS, this.name);
    this.state = State.INIT;
    this.editState = EditState.DEFAULT;
  }
  beginEdit(stateEdit: EditState) {
    this.state = State.EDIT;
    this.editState = stateEdit;
    this.removeControlsEdit();
  }
  remove(element = null) {
    if (!element) {
      element = this.element;
    }
    let parent = element.parentNode;
    parent.removeChild(element);
  }
  removeControlsEdit(): void {
    this.controlsEdit.forEach((control) => {
      this.remove(control.element);
    });
    this.controlsEdit = [];
  }
  abstract firstPoint(point: Point): ElementRef;
  abstract editPoint(point: Point): void;
  abstract generateControlsEdit(): ShapeButton[];
  abstract lastPoint(point: Point, duration: number): void;
  focus(): void {}
}
