import { ElementRef } from "@angular/core";
import { Point } from "./point";
import { ShapeButton } from "./controls/shape-button";
import { PropertyAllowed } from "./properties/properties-allowed";
import { RgbToHex } from "./properties/rgb-to-hex";

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
  DIV = "DIV",
}
export enum Behavior {
  PRIMARY,
  SECUNDARY,
}
export abstract class Shape {
  attributes: any;
  properties: any;
  state: State;
  propertiesAllowed: PropertyAllowed[];
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
    if (this.element.hasAttributeNS(null, "stroke-width"))
      return this.element.getAttributeNS(null, "stroke-width");
    else return "1";
  }
  set strokeOpacity(strokeOpacity: string) {
    this.element.setAttributeNS(null, "stroke-opacity", strokeOpacity);
  }
  get strokeOpacity() {
    if (this.element.hasAttributeNS(null, "stroke-opacity"))
      return this.element.getAttributeNS(null, "stroke-opacity");
    else return "100";
  }
  set fillOpacity(fillOpacity: string) {
    this.element.setAttributeNS(null, "fill-opacity", fillOpacity);
  }
  get fillOpacity() {
    if (this.element.hasAttributeNS(null, "fill-opacity"))
      return this.element.getAttributeNS(null, "fill-opacity");
    else return "100";
  }
  set fontSize(fontSize: string) {
    this.element.firstChild.style.fontSize = fontSize + "px";
  }
  get fontSize() {
    if (this.element.firstChild.style.fontSize)
      return this.element.firstChild.style.fontSize.replace("px", "");
    else return "12";
  }
  set color(color: string) {
    this.element.firstChild.style.color = color;
  }
  get color() {
    if (this.element.firstChild.style.color)
      return RgbToHex.execute(this.element.firstChild.style.color);
    else return "#000000";
  }
  set opacity(opacity: string) {
    this.element.firstChild.style.opacity = opacity;
  }
  get opacity() {
    if (this.element.firstChild.style.opacity)
      return this.element.firstChild.style.opacity;
    else return "1";
  }
  set textAlign(textAlign: string) {
    this.element.firstChild.style.textAlign = textAlign;
  }
  get textAlign() {
    if (this.element.firstChild.style.textAlign)
      return this.element.firstChild.style.textAlign;
    else return "left";
  }
  set verticalAlign(verticalAlign: string) {
    this.element.firstChild.style.verticalAlign = verticalAlign;
  }
  get verticalAlign() {
    if (this.element.firstChild.style.verticalAlign)
      return this.element.firstChild.style.verticalAlign;
    else return "top";
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
