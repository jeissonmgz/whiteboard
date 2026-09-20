import { PolylineShape, TypeShape, PropertyAllowed, ControlHandle, EditState, Point } from '../../../types/shape';
import { ShapeStrategy, BoundingBox } from '../types';
import { rotatePoint, getBoundingBoxHandles, getRotationHandle } from '../utils/mathUtils';

export class PolylineStrategy implements ShapeStrategy<PolylineShape> {
  public readonly type = TypeShape.POLYLINE;

  public getPropertiesAllowed(): PropertyAllowed[] {
    return [PropertyAllowed.line];
  }

  public getCenter(shape: PolylineShape): Point {
    const pts = this.parsePoints(shape.points);
    if (pts.length === 0) return { x: 0, y: 0 };
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
    };
  }

  public getBoundingBox(shape: PolylineShape): BoundingBox {
    const pts = this.parsePoints(shape.points);
    if (pts.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  public generateControlHandles(shape: PolylineShape): ControlHandle[] {
    const bbox = this.getBoundingBox(shape);
    const center = this.getCenter(shape);
    const handles = getBoundingBoxHandles(shape.id, bbox);
    handles.push(getRotationHandle(shape, center, bbox));
    return handles;
  }

  public createShape(id: string, startPoint: Point): PolylineShape {
    return {
      id,
      type: TypeShape.POLYLINE,
      points: `${startPoint.x},${startPoint.y}`,
      stroke: 'black',
      fill: 'none',
      strokeWidth: 1,
      strokeOpacity: 1,
      fillOpacity: 1,
    };
  }

  public updateShapePoint(
    shape: PolylineShape,
    currentPoint: Point,
    initPoint: Point,
    editState: EditState,
    initialShape?: PolylineShape | null
  ): PolylineShape {
    const base = initialShape || shape;
    const rotation = base.rotation || 0;

    if (editState === EditState.CENTER) {
      const dx = currentPoint.x - initPoint.x;
      const dy = currentPoint.y - initPoint.y;
      const shiftedPoints = this.parsePoints(base.points)
        .map((p) => `${p.x + dx},${p.y + dy}`)
        .join(' ');
      return {
        ...shape,
        points: shiftedPoints,
      };
    }

    if (editState === EditState.DEFAULT) {
      return {
        ...shape,
        points: shape.points + ` ${currentPoint.x},${currentPoint.y}`,
      };
    }

    const baseBbox = this.getBoundingBox(base);
    const oldCenter = this.getCenter(base);

    let localAnchor: Point;
    let resizeWidth = true;
    let resizeHeight = true;

    switch (editState) {
      case EditState.NW_POINT:
        localAnchor = { x: baseBbox.x + baseBbox.width, y: baseBbox.y + baseBbox.height };
        break;
      case EditState.NE_POINT:
        localAnchor = { x: baseBbox.x, y: baseBbox.y + baseBbox.height };
        break;
      case EditState.SW_POINT:
        localAnchor = { x: baseBbox.x + baseBbox.width, y: baseBbox.y };
        break;
      case EditState.SE_POINT:
        localAnchor = { x: baseBbox.x, y: baseBbox.y };
        break;
      case EditState.W_POINT:
        localAnchor = { x: baseBbox.x + baseBbox.width, y: baseBbox.y + baseBbox.height / 2 };
        resizeHeight = false;
        break;
      case EditState.E_POINT:
        localAnchor = { x: baseBbox.x, y: baseBbox.y + baseBbox.height / 2 };
        resizeHeight = false;
        break;
      case EditState.N_POINT:
        localAnchor = { x: baseBbox.x + baseBbox.width / 2, y: baseBbox.y + baseBbox.height };
        resizeWidth = false;
        break;
      case EditState.S_POINT:
        localAnchor = { x: baseBbox.x + baseBbox.width / 2, y: baseBbox.y };
        resizeWidth = false;
        break;
      default:
        localAnchor = { x: baseBbox.x, y: baseBbox.y };
        break;
    }

    const anchorWorld = rotatePoint(localAnchor, oldCenter, rotation);
    const localMouse = rotatePoint(currentPoint, oldCenter, -rotation);

    let tempX = baseBbox.x;
    let tempW = baseBbox.width;
    let tempY = baseBbox.y;
    let tempH = baseBbox.height;

    if (resizeWidth) {
      tempX = Math.min(localAnchor.x, localMouse.x);
      tempW = Math.max(5, Math.abs(localAnchor.x - localMouse.x));
    }
    if (resizeHeight) {
      tempY = Math.min(localAnchor.y, localMouse.y);
      tempH = Math.max(5, Math.abs(localAnchor.y - localMouse.y));
    }

    const tempCenter = { x: tempX + tempW / 2, y: tempY + tempH / 2 };
    const currentAnchorWorld = rotatePoint(localAnchor, tempCenter, rotation);
    const shiftX = anchorWorld.x - currentAnchorWorld.x;
    const shiftY = anchorWorld.y - currentAnchorWorld.y;

    const origW = baseBbox.width === 0 ? 1 : baseBbox.width;
    const origH = baseBbox.height === 0 ? 1 : baseBbox.height;

    const scaledPoints = this.parsePoints(base.points)
      .map((p) => {
        const normX = (p.x - baseBbox.x) / origW;
        const normY = (p.y - baseBbox.y) / origH;
        const newPx = tempX + (resizeWidth ? normX * tempW : (p.x - baseBbox.x)) + shiftX;
        const newPy = tempY + (resizeHeight ? normY * tempH : (p.y - baseBbox.y)) + shiftY;
        return `${newPx.toFixed(2)},${newPy.toFixed(2)}`;
      })
      .join(' ');

    return {
      ...shape,
      points: scaledPoints,
    };
  }

  private parsePoints(pointsStr: string): Point[] {
    if (!pointsStr) return [];
    return pointsStr
      .trim()
      .split(/\s+/)
      .map((p) => {
        const [x, y] = p.split(',').map(Number);
        return { x: isNaN(x) ? 0 : x, y: isNaN(y) ? 0 : y };
      });
  }
}
