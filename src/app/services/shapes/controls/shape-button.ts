import { Shape, Behavior, EditState } from "../shape";
export abstract class ShapeButton {
  constructor(
    public element: any,
    public editState: EditState,
    public shape: Shape
  ) {
    this.element.setAttributeNS(null, "secundary", "true");
    this.element.setAttributeNS(null, "state", this.editState);
  }
}
