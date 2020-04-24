import { ShapeButton } from "./shape-button";
import { Rect } from "../rect";
import { Ellipse } from "../ellipse";
import { EditState, SVG_NS, Shape } from "../shape";
import { CenterButton } from "./center-button";

export class ContainerButton extends ShapeButton {
  x: number;
  y: number;
  width: number;
  height: number;
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    shape: Shape,
    editState: EditState
  ) {
    let rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttributeNS(null, "x", x.toString());
    rect.setAttributeNS(null, "y", y.toString());
    rect.setAttributeNS(null, "width", width.toString());
    rect.setAttributeNS(null, "height", height.toString());
    rect.setAttributeNS(null, "stroke-width", "5");
    rect.setAttributeNS(null, "fill", "none");
    rect.setAttributeNS(null, "stroke", "#2196f3");
    rect.style.cursor = "pointer";
    super(rect, editState, shape);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get generateCornersAndSide(): CenterButton[] {
    return [
      { ...this },
      new CenterButton(
        this.x + this.width / 2,
        this.y + this.height / 2,
        EditState.CENTER,
        this.shape,
        "move"
      ),
      new CenterButton(
        this.x,
        this.y,
        EditState.NW_POINT,
        this.shape,
        "nw-resize"
      ),
      new CenterButton(
        this.x + this.width,
        this.y,
        EditState.NE_POINT,
        this.shape,
        "ne-resize"
      ),
      new CenterButton(
        this.x,
        this.y + this.height,
        EditState.SW_POINT,
        this.shape,
        "sw-resize"
      ),
      new CenterButton(
        this.x + this.width,
        this.y + this.height,
        EditState.SE_POINT,
        this.shape,
        "se-resize"
      ),
      new CenterButton(
        this.x,
        this.y + this.height / 2,
        EditState.W_POINT,
        this.shape,
        "w-resize"
      ),
      new CenterButton(
        this.x + this.width / 2,
        this.y,
        EditState.N_POINT,
        this.shape,
        "n-resize"
      ),
      new CenterButton(
        this.x + this.width / 2,
        this.y + this.height,
        EditState.S_POINT,
        this.shape,
        "s-resize"
      ),
      new CenterButton(
        this.x + this.width,
        this.y + this.height / 2,
        EditState.E_POINT,
        this.shape,
        "e-resize"
      ),
    ];
  }
}
