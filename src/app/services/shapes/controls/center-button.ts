import { ShapeButton } from "./shape-button";
import { Ellipse } from "../ellipse";
import { EditState, SVG_NS, Shape } from "../shape";

export class CenterButton extends ShapeButton {
  constructor(
    x: number,
    y: number,
    editState: EditState,
    shape: Shape,
    cursor: string = "pointer"
  ) {
    let circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttributeNS(null, "cx", x.toString());
    circle.setAttributeNS(null, "cy", y.toString());
    circle.setAttributeNS(null, "r", "7");
    circle.setAttributeNS(null, "fill", "#2196f3");
    circle.setAttributeNS(null, "stroke", "none");
    circle.style.cursor = cursor;
    super(circle, editState, shape);
  }
}
