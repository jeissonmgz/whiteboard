import { ElementRef } from "@angular/core";
import { Point } from "./point";

export const SVG_NS = "http://www.w3.org/2000/svg";
export enum State {
  INIT,
  FINISH,
  EDIT,
}
export enum TypeShape {
  ELLIPSE = "ellipse",
  LINE = "line",
  POLYLINE = "polyline",
  RECT = "rect",
  TEXT = "foreignObject",
}
export abstract class Shape {
  attributes: any;
  properties: any;
  state: State;
  constructor(public element: any, public name: string) {
    if (this.element == null) {
      this.init();
    } else {
      this.state = State.EDIT;
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
  init() {
    this.element = document.createElementNS(SVG_NS, this.name);
    this.state = State.INIT;
  }
  abstract firstPoint(point: Point): ElementRef;
  abstract addPoint(point: Point): void;
  abstract lastPoint(point: Point, duration: number): void;
  focus(): void {}
}
