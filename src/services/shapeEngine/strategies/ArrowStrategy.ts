import { ArrowShape, TypeShape, PropertyAllowed, ControlHandle, EditState, Point } from '../../../types/shape';
import { ShapeStrategy, BoundingBox } from '../types';
import { rotatePoint, getRotationHandle } from '../utils/mathUtils';

export class ArrowStrategy implements ShapeStrategy<ArrowShape> {
  public readonly type = TypeShape.ARROW;

  public getPropertiesAllowed(): PropertyAllowed[] {
    return [PropertyAllowed.line];
  }

  public getCenter(shape: ArrowShape): Point {
    return {
      x: (shape.x1 + shape.x2) / 2,
      y: (shape.y1 + shape.y2) / 2,
    };
  }

  public getBoundingBox(shape: ArrowShape): BoundingBox {
    const minX = Math.min(shape.x1, shape.x2);
    const maxX = Math.max(shape.x1, shape.x2);
    const minY = Math.min(shape.y1, shape.y2);
    const maxY = Math.max(shape.y1, shape.y2);
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  public generateControlHandles(shape: ArrowShape): ControlHandle[] {
    const handles: ControlHandle[] = [
      {
        id: `${shape.id}-p1`,
        x: shape.x1,
        y: shape.y1,
        editState: EditState.FIRST_POINT,
        cursor: 'move',
        type: 'circle',
      },
      {
        id: `${shape.id}-p2`,
        x: shape.x2,
        y: shape.y2,
        editState: EditState.DEFAULT,
        cursor: 'move',
        type: 'circle',
      },
    ];

    const center = this.getCenter(shape);
    const bbox = this.getBoundingBox(shape);
    handles.push(getRotationHandle(shape, center, bbox));

    return handles;
  }

  public createShape(id: string, startPoint: Point): ArrowShape {
    return {
      id,
      type: TypeShape.ARROW,
      x1: startPoint.x,
      y1: startPoint.y,
      x2: startPoint.x,
      y2: startPoint.y,
      stroke: 'var(--text-primary)',
      fill: 'none',
      strokeWidth: 1,
      strokeOpacity: 1,
      fillOpacity: 1,
      markerStart: false,
      markerEnd: true,
    };
  }

  public updateShapePoint(
    shape: ArrowShape,
    currentPoint: Point,
    initPoint: Point,
    editState: EditState,
    initialShape?: ArrowShape | null
  ): ArrowShape {
    const base = initialShape || shape;
    const rotation = base.rotation || 0;

    if (editState === EditState.CENTER) {
      const dx = currentPoint.x - initPoint.x;
      const dy = currentPoint.y - initPoint.y;
      return {
        ...shape,
        x1: base.x1 + dx,
        y1: base.y1 + dy,
        x2: base.x2 + dx,
        y2: base.y2 + dy,
      };
    }

    const lineCenter = this.getCenter(base);
    const p1World = rotatePoint({ x: base.x1, y: base.y1 }, lineCenter, rotation);
    const p2World = rotatePoint({ x: base.x2, y: base.y2 }, lineCenter, rotation);

    if (editState === EditState.FIRST_POINT) {
      return {
        ...shape,
        x1: currentPoint.x,
        y1: currentPoint.y,
        x2: p2World.x,
        y2: p2World.y,
        rotation: 0,
      };
    } else {
      return {
        ...shape,
        x1: p1World.x,
        y1: p1World.y,
        x2: currentPoint.x,
        y2: currentPoint.y,
        rotation: 0,
      };
    }
  }
}
