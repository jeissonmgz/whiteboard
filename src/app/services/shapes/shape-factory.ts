import { TypeShape, Shape } from "./shape";
import { Ellipse } from "./ellipse";
import { Line } from "./line";
import { Polyline } from "./polyline";
import { Rect } from "./rect";
import { Text } from "./text";
export class ShapeFactory {
  static getShape(typeShape: string, element) {
    switch (typeShape) {
      case TypeShape.ELLIPSE:
        return new Ellipse(element);
        break;
      case TypeShape.LINE:
        return new Line(element);
        break;
      case TypeShape.POLYLINE:
        return new Polyline(element);
        break;
      case TypeShape.RECT:
        return new Rect(element);
        break;
      case TypeShape.TEXT:
        return new Text(element);
        break;
    }
    return null;
  }
}
