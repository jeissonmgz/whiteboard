import { TextShape, TypeShape, PropertyAllowed, ControlHandle, EditState, Point } from '../../../types/shape';
import { ShapeStrategy, BoundingBox } from '../types';
import { rotatePoint, getBoundingBoxHandles, getRotationHandle } from '../utils/mathUtils';

export class TextStrategy implements ShapeStrategy<TextShape> {
  public readonly type = TypeShape.TEXT;

  public getPropertiesAllowed(): PropertyAllowed[] {
    return [PropertyAllowed.text, PropertyAllowed.background, PropertyAllowed.line];
  }

  public getCenter(shape: TextShape): Point {
    return {
      x: shape.x + shape.width / 2,
      y: shape.y + shape.height / 2,
    };
  }

  public getBoundingBox(shape: TextShape): BoundingBox {
    return {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
    };
  }

  public generateControlHandles(shape: TextShape): ControlHandle[] {
    const bbox = this.getBoundingBox(shape);
    const center = this.getCenter(shape);
    const handles = getBoundingBoxHandles(shape.id, bbox);
    handles.push(getRotationHandle(shape, center, bbox));
    return handles;
  }

  public createShape(id: string, startPoint: Point): TextShape {
    return {
      id,
      type: TypeShape.TEXT,
      x: startPoint.x,
      y: startPoint.y,
      width: 120,
      height: 40,
      stroke: 'var(--text-primary)',
      fill: 'none',
      strokeWidth: 0,
      strokeOpacity: 1,
      fillOpacity: 1,
      color: 'var(--text-primary)',
      fontSize: 14,
      textAlign: 'left',
      verticalAlign: 'top',
      content: '',
    };
  }

  public updateShapePoint(
    shape: TextShape,
    currentPoint: Point,
    initPoint: Point,
    editState: EditState,
    initialShape?: TextShape | null
  ): TextShape {
    const base = initialShape || shape;
    const rotation = base.rotation || 0;

    if (editState === EditState.CENTER) {
      const dx = currentPoint.x - initPoint.x;
      const dy = currentPoint.y - initPoint.y;
      return {
        ...shape,
        x: base.x + dx,
        y: base.y + dy,
        width: base.width,
        height: base.height,
      };
    }

    const oldCenter = this.getCenter(base);

    let localAnchor: Point;
    let resizeWidth = true;
    let resizeHeight = true;

    switch (editState) {
      case EditState.NW_POINT:
        localAnchor = { x: base.x + base.width, y: base.y + base.height };
        break;
      case EditState.NE_POINT:
        localAnchor = { x: base.x, y: base.y + base.height };
        break;
      case EditState.SW_POINT:
        localAnchor = { x: base.x + base.width, y: base.y };
        break;
      case EditState.SE_POINT:
        localAnchor = { x: base.x, y: base.y };
        break;
      case EditState.W_POINT:
        localAnchor = { x: base.x + base.width, y: base.y + base.height / 2 };
        resizeHeight = false;
        break;
      case EditState.E_POINT:
        localAnchor = { x: base.x, y: base.y + base.height / 2 };
        resizeHeight = false;
        break;
      case EditState.N_POINT:
        localAnchor = { x: base.x + base.width / 2, y: base.y + base.height };
        resizeWidth = false;
        break;
      case EditState.S_POINT:
        localAnchor = { x: base.x + base.width / 2, y: base.y };
        resizeWidth = false;
        break;
      default:
        localAnchor = { x: base.x, y: base.y };
        break;
    }

    const anchorWorld = rotatePoint(localAnchor, oldCenter, rotation);
    const localMouse = rotatePoint(currentPoint, oldCenter, -rotation);

    let tempX = base.x;
    let tempW = base.width;
    let tempY = base.y;
    let tempH = base.height;

    if (resizeWidth) {
      tempX = Math.min(localAnchor.x, localMouse.x);
      tempW = Math.max(10, Math.abs(localAnchor.x - localMouse.x));
    }
    if (resizeHeight) {
      tempY = Math.min(localAnchor.y, localMouse.y);
      tempH = Math.max(10, Math.abs(localAnchor.y - localMouse.y));
    }

    const tempCenter = { x: tempX + tempW / 2, y: tempY + tempH / 2 };
    const currentAnchorWorld = rotatePoint(localAnchor, tempCenter, rotation);

    const shiftX = anchorWorld.x - currentAnchorWorld.x;
    const shiftY = anchorWorld.y - currentAnchorWorld.y;

    return {
      ...shape,
      x: tempX + shiftX,
      y: tempY + shiftY,
      width: tempW,
      height: tempH,
    };
  }
}
