import { EllipseShape, TypeShape, PropertyAllowed, ControlHandle, EditState, Point } from '../../../types/shape';
import { ShapeStrategy, BoundingBox } from '../types';
import { rotatePoint, getBoundingBoxHandles, getRotationHandle } from '../utils/mathUtils';

export class EllipseStrategy implements ShapeStrategy<EllipseShape> {
  public readonly type = TypeShape.ELLIPSE;

  public getPropertiesAllowed(): PropertyAllowed[] {
    return [PropertyAllowed.background, PropertyAllowed.line];
  }

  public getCenter(shape: EllipseShape): Point {
    return {
      x: shape.cx,
      y: shape.cy,
    };
  }

  public getBoundingBox(shape: EllipseShape): BoundingBox {
    return {
      x: shape.cx - shape.rx,
      y: shape.cy - shape.ry,
      width: shape.rx * 2,
      height: shape.ry * 2,
    };
  }

  public generateControlHandles(shape: EllipseShape): ControlHandle[] {
    const bbox = this.getBoundingBox(shape);
    const center = this.getCenter(shape);
    const handles = getBoundingBoxHandles(shape.id, bbox);
    handles.push(getRotationHandle(shape, center, bbox));
    return handles;
  }

  public createShape(id: string, startPoint: Point): EllipseShape {
    return {
      id,
      type: TypeShape.ELLIPSE,
      cx: startPoint.x,
      cy: startPoint.y,
      rx: 0,
      ry: 0,
      stroke: 'black',
      fill: '#ffffff',
      strokeWidth: 1,
      strokeOpacity: 1,
      fillOpacity: 1,
    };
  }

  public updateShapePoint(
    shape: EllipseShape,
    currentPoint: Point,
    initPoint: Point,
    editState: EditState,
    initialShape?: EllipseShape | null
  ): EllipseShape {
    const base = initialShape || shape;
    const rotation = base.rotation || 0;

    if (editState === EditState.CENTER) {
      const dx = currentPoint.x - initPoint.x;
      const dy = currentPoint.y - initPoint.y;
      return {
        ...shape,
        cx: base.cx + dx,
        cy: base.cy + dy,
        rx: base.rx,
        ry: base.ry,
      };
    }

    const center = { x: base.cx, y: base.cy };
    const localMouse = rotatePoint(currentPoint, center, -rotation);
    const diffX = Math.abs(localMouse.x - center.x);
    const diffY = Math.abs(localMouse.y - center.y);

    let newRx = base.rx;
    let newRy = base.ry;

    switch (editState) {
      case EditState.W_POINT:
      case EditState.E_POINT:
        newRx = Math.max(5, diffX);
        break;
      case EditState.N_POINT:
      case EditState.S_POINT:
        newRy = Math.max(5, diffY);
        break;
      default:
        newRx = Math.max(5, diffX);
        newRy = Math.max(5, diffY);
        break;
    }
    return { ...shape, cx: center.x, cy: center.y, rx: newRx, ry: newRy };
  }
}
