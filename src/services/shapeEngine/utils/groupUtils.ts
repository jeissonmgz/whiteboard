import { ShapeData, ControlHandle, EditState, Point, TypeShape, RectShape, EllipseShape, LineShape, ArrowShape, PolylineShape, TextShape } from '../../../types/shape';
import { BoundingBox } from '../types';
import { rotatePoint, getBoundingBoxHandles } from './mathUtils';
import { ShapeEngineFactory } from '../ShapeEngineFactory';

export function getGroupBoundingBox(shapes: ShapeData[]): BoundingBox {
  if (shapes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

  const bboxes = shapes.map((shape) => {
    const strategy = ShapeEngineFactory.getStrategy(shape.type);
    const center = strategy.getCenter(shape);
    const bbox = strategy.getBoundingBox(shape);
    if (!shape.rotation) return bbox;

    const corners = [
      rotatePoint({ x: bbox.x, y: bbox.y }, center, shape.rotation),
      rotatePoint({ x: bbox.x + bbox.width, y: bbox.y }, center, shape.rotation),
      rotatePoint({ x: bbox.x, y: bbox.y + bbox.height }, center, shape.rotation),
      rotatePoint({ x: bbox.x + bbox.width, y: bbox.y + bbox.height }, center, shape.rotation),
    ];
    const xs = corners.map((c) => c.x);
    const ys = corners.map((c) => c.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  });

  const minX = Math.min(...bboxes.map((b) => b.x));
  const maxX = Math.max(...bboxes.map((b) => b.x + b.width));
  const minY = Math.min(...bboxes.map((b) => b.y));
  const maxY = Math.max(...bboxes.map((b) => b.y + b.height));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function generateGroupControlHandles(groupBbox: BoundingBox): ControlHandle[] {
  const handles = getBoundingBoxHandles('group', groupBbox);
  const groupCenter = {
    x: groupBbox.x + groupBbox.width / 2,
    y: groupBbox.y + groupBbox.height / 2,
  };

  // Group rotation handle
  handles.push({
    id: 'group-rotate',
    x: groupCenter.x,
    y: groupBbox.y - 25,
    editState: EditState.ROTATE,
    cursor: 'grab',
    type: 'circle',
    stemY: groupBbox.y,
  });

  return handles;
}

export function updateGroupShapes(
  shapes: ShapeData[],
  selectedIds: string[],
  currentPoint: Point,
  initPoint: Point,
  editState: EditState,
  initialShapesMap: Map<string, ShapeData>
): ShapeData[] {
  const selectedInitialShapes = selectedIds
    .map((id) => initialShapesMap.get(id))
    .filter((s): s is ShapeData => Boolean(s));

  if (selectedInitialShapes.length === 0) return shapes;

  const initialGroupBbox = getGroupBoundingBox(selectedInitialShapes);
  const initialGroupCenter = {
    x: initialGroupBbox.x + initialGroupBbox.width / 2,
    y: initialGroupBbox.y + initialGroupBbox.height / 2,
  };

  // 1. Group Translation
  if (editState === EditState.CENTER) {
    const dx = currentPoint.x - initPoint.x;
    const dy = currentPoint.y - initPoint.y;

    return shapes.map((shape) => {
      if (!selectedIds.includes(shape.id)) return shape;
      const base = initialShapesMap.get(shape.id) || shape;
      const strategy = ShapeEngineFactory.getStrategy(base.type);
      return strategy.updateShapePoint(shape, currentPoint, initPoint, EditState.CENTER, base);
    });
  }

  // 2. Group Rotation
  if (editState === EditState.ROTATE) {
    const initDx = initPoint.x - initialGroupCenter.x;
    const initDy = initPoint.y - initialGroupCenter.y;
    const initDist = Math.hypot(initDx, initDy);
    const initAngle = initDist > 2 ? Math.atan2(initDy, initDx) * (180 / Math.PI) : -90;

    const currDx = currentPoint.x - initialGroupCenter.x;
    const currDy = currentPoint.y - initialGroupCenter.y;
    const currAngle = Math.atan2(currDy, currDx) * (180 / Math.PI);

    let deltaAngle = currAngle - initAngle;

    return shapes.map((shape) => {
      if (!selectedIds.includes(shape.id)) return shape;
      const base = initialShapesMap.get(shape.id) || shape;
      return rotateShapeAroundCenter(base, initialGroupCenter, deltaAngle);
    });
  }

  // 3. Group Resizing
  let localAnchor: Point;
  let resizeWidth = true;
  let resizeHeight = true;

  switch (editState) {
    case EditState.NW_POINT:
      localAnchor = { x: initialGroupBbox.x + initialGroupBbox.width, y: initialGroupBbox.y + initialGroupBbox.height };
      break;
    case EditState.NE_POINT:
      localAnchor = { x: initialGroupBbox.x, y: initialGroupBbox.y + initialGroupBbox.height };
      break;
    case EditState.SW_POINT:
      localAnchor = { x: initialGroupBbox.x + initialGroupBbox.width, y: initialGroupBbox.y };
      break;
    case EditState.SE_POINT:
      localAnchor = { x: initialGroupBbox.x, y: initialGroupBbox.y };
      break;
    case EditState.W_POINT:
      localAnchor = { x: initialGroupBbox.x + initialGroupBbox.width, y: initialGroupBbox.y + initialGroupBbox.height / 2 };
      resizeHeight = false;
      break;
    case EditState.E_POINT:
      localAnchor = { x: initialGroupBbox.x, y: initialGroupBbox.y + initialGroupBbox.height / 2 };
      resizeHeight = false;
      break;
    case EditState.N_POINT:
      localAnchor = { x: initialGroupBbox.x + initialGroupBbox.width / 2, y: initialGroupBbox.y + initialGroupBbox.height };
      resizeWidth = false;
      break;
    case EditState.S_POINT:
      localAnchor = { x: initialGroupBbox.x + initialGroupBbox.width / 2, y: initialGroupBbox.y };
      resizeWidth = false;
      break;
    default:
      localAnchor = { x: initialGroupBbox.x, y: initialGroupBbox.y };
      break;
  }

  let tempX = initialGroupBbox.x;
  let tempW = initialGroupBbox.width;
  let tempY = initialGroupBbox.y;
  let tempH = initialGroupBbox.height;

  if (resizeWidth) {
    tempX = Math.min(localAnchor.x, currentPoint.x);
    tempW = Math.max(10, Math.abs(localAnchor.x - currentPoint.x));
  }
  if (resizeHeight) {
    tempY = Math.min(localAnchor.y, currentPoint.y);
    tempH = Math.max(10, Math.abs(localAnchor.y - currentPoint.y));
  }

  const scaleX = resizeWidth ? tempW / (initialGroupBbox.width || 1) : 1;
  const scaleY = resizeHeight ? tempH / (initialGroupBbox.height || 1) : 1;

  return shapes.map((shape) => {
    if (!selectedIds.includes(shape.id)) return shape;
    const base = initialShapesMap.get(shape.id) || shape;
    return scaleShapeFromAnchor(base, localAnchor, scaleX, scaleY, tempX, tempY, initialGroupBbox);
  });
}

function rotateShapeAroundCenter(shape: ShapeData, groupCenter: Point, deltaAngle: number): ShapeData {
  const strategy = ShapeEngineFactory.getStrategy(shape.type);

  switch (shape.type) {
    case TypeShape.RECT:
    case TypeShape.TEXT: {
      const rect = shape as RectShape | TextShape;
      const center = strategy.getCenter(rect);
      const newCenter = rotatePoint(center, groupCenter, deltaAngle);
      const newRotation = Math.round(((rect.rotation || 0) + deltaAngle) % 360);
      return {
        ...rect,
        x: newCenter.x - rect.width / 2,
        y: newCenter.y - rect.height / 2,
        rotation: newRotation < 0 ? newRotation + 360 : newRotation,
      } as any;
    }
    case TypeShape.ELLIPSE: {
      const ellipse = shape as EllipseShape;
      const newCenter = rotatePoint({ x: ellipse.cx, y: ellipse.cy }, groupCenter, deltaAngle);
      const newRotation = Math.round(((ellipse.rotation || 0) + deltaAngle) % 360);
      return {
        ...ellipse,
        cx: newCenter.x,
        cy: newCenter.y,
        rotation: newRotation < 0 ? newRotation + 360 : newRotation,
      };
    }
    case TypeShape.LINE:
    case TypeShape.ARROW: {
      const line = shape as LineShape | ArrowShape;
      const lineCenter = strategy.getCenter(line);
      const rot = line.rotation || 0;
      const p1World = rotatePoint(rotatePoint({ x: line.x1, y: line.y1 }, lineCenter, rot), groupCenter, deltaAngle);
      const p2World = rotatePoint(rotatePoint({ x: line.x2, y: line.y2 }, lineCenter, rot), groupCenter, deltaAngle);
      return {
        ...line,
        x1: p1World.x,
        y1: p1World.y,
        x2: p2World.x,
        y2: p2World.y,
        rotation: 0,
      } as any;
    }
    case TypeShape.POLYLINE: {
      const polyline = shape as PolylineShape;
      const polyCenter = strategy.getCenter(polyline);
      const rot = polyline.rotation || 0;
      const rotatedPts = polyline.points
        .trim()
        .split(/\s+/)
        .map((p) => {
          const [px, py] = p.split(',').map(Number);
          const worldP = rotatePoint({ x: px, y: py }, polyCenter, rot);
          const newP = rotatePoint(worldP, groupCenter, deltaAngle);
          return `${newP.x.toFixed(2)},${newP.y.toFixed(2)}`;
        })
        .join(' ');
      return {
        ...polyline,
        points: rotatedPts,
        rotation: 0,
      };
    }
  }
}

function scaleShapeFromAnchor(
  shape: ShapeData,
  anchor: Point,
  scaleX: number,
  scaleY: number,
  tempX: number,
  tempY: number,
  groupBbox: BoundingBox
): ShapeData {
  switch (shape.type) {
    case TypeShape.RECT:
    case TypeShape.TEXT: {
      const rect = shape as RectShape | TextShape;
      const normX = (rect.x - anchor.x) / (groupBbox.width || 1);
      const normY = (rect.y - anchor.y) / (groupBbox.height || 1);
      const newX = anchor.x + normX * scaleX * groupBbox.width;
      const newY = anchor.y + normY * scaleY * groupBbox.height;
      const newW = Math.max(10, rect.width * Math.abs(scaleX));
      const newH = Math.max(10, rect.height * Math.abs(scaleY));
      return {
        ...rect,
        x: newX,
        y: newY,
        width: newW,
        height: newH,
      } as any;
    }
    case TypeShape.ELLIPSE: {
      const ellipse = shape as EllipseShape;
      const normCx = (ellipse.cx - anchor.x) / (groupBbox.width || 1);
      const normCy = (ellipse.cy - anchor.y) / (groupBbox.height || 1);
      const newCx = anchor.x + normCx * scaleX * groupBbox.width;
      const newCy = anchor.y + normCy * scaleY * groupBbox.height;
      const newRx = Math.max(5, ellipse.rx * Math.abs(scaleX));
      const newRy = Math.max(5, ellipse.ry * Math.abs(scaleY));
      return {
        ...ellipse,
        cx: newCx,
        cy: newCy,
        rx: newRx,
        ry: newRy,
      };
    }
    case TypeShape.LINE:
    case TypeShape.ARROW: {
      const line = shape as LineShape | ArrowShape;
      const normX1 = (line.x1 - anchor.x) / (groupBbox.width || 1);
      const normY1 = (line.y1 - anchor.y) / (groupBbox.height || 1);
      const normX2 = (line.x2 - anchor.x) / (groupBbox.width || 1);
      const normY2 = (line.y2 - anchor.y) / (groupBbox.height || 1);
      return {
        ...line,
        x1: anchor.x + normX1 * scaleX * groupBbox.width,
        y1: anchor.y + normY1 * scaleY * groupBbox.height,
        x2: anchor.x + normX2 * scaleX * groupBbox.width,
        y2: anchor.y + normY2 * scaleY * groupBbox.height,
      } as any;
    }
    case TypeShape.POLYLINE: {
      const polyline = shape as PolylineShape;
      const scaledPts = polyline.points
        .trim()
        .split(/\s+/)
        .map((p) => {
          const [px, py] = p.split(',').map(Number);
          const normX = (px - anchor.x) / (groupBbox.width || 1);
          const normY = (py - anchor.y) / (groupBbox.height || 1);
          const newPx = anchor.x + normX * scaleX * groupBbox.width;
          const newPy = anchor.y + normY * scaleY * groupBbox.height;
          return `${newPx.toFixed(2)},${newPy.toFixed(2)}`;
        })
        .join(' ');
      return {
        ...polyline,
        points: scaledPts,
      };
    }
  }
}
