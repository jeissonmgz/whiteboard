import {
  ShapeData,
  TypeShape,
  PropertyAllowed,
  EditState,
  ControlHandle,
  RectShape,
  EllipseShape,
  LineShape,
  ArrowShape,
  PolylineShape,
  TextShape,
  Point,
} from '../types/shape';

export function getPropertiesAllowed(typeShape: TypeShape): PropertyAllowed[] {
  switch (typeShape) {
    case TypeShape.RECT:
    case TypeShape.ELLIPSE:
      return [PropertyAllowed.background, PropertyAllowed.line];
    case TypeShape.LINE:
    case TypeShape.ARROW:
    case TypeShape.POLYLINE:
      return [PropertyAllowed.line];
    case TypeShape.TEXT:
      return [PropertyAllowed.text, PropertyAllowed.background, PropertyAllowed.line];
    default:
      return [];
  }
}

export function getShapeCenter(shape: ShapeData): Point {
  switch (shape.type) {
    case TypeShape.RECT:
    case TypeShape.TEXT:
      return {
        x: shape.x + shape.width / 2,
        y: shape.y + shape.height / 2,
      };
    case TypeShape.ELLIPSE:
      return {
        x: shape.cx,
        y: shape.cy,
      };
    case TypeShape.LINE:
    case TypeShape.ARROW:
      return {
        x: (shape.x1 + shape.x2) / 2,
        y: (shape.y1 + shape.y2) / 2,
      };
    case TypeShape.POLYLINE: {
      const pts = shape.points
        .trim()
        .split(/\s+/)
        .map((p) => p.split(',').map(Number))
        .filter((p) => p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]));
      if (pts.length === 0) return { x: 0, y: 0 };
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      return {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
      };
    }
  }
}

export function getShapeBoundingBox(shape: ShapeData): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  switch (shape.type) {
    case TypeShape.RECT:
    case TypeShape.TEXT:
      return {
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
      };
    case TypeShape.ELLIPSE:
      return {
        x: shape.cx - shape.rx,
        y: shape.cy - shape.ry,
        width: shape.rx * 2,
        height: shape.ry * 2,
      };
    case TypeShape.LINE:
    case TypeShape.ARROW: {
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
    case TypeShape.POLYLINE: {
      const pts = shape.points
        .trim()
        .split(/\s+/)
        .map((p) => p.split(',').map(Number))
        .filter((p) => p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]));
      if (pts.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
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
  }
}

export function rotatePoint(point: Point, center: Point, angleDegrees: number): Point {
  if (!angleDegrees) return point;
  const rad = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + (dx * cos - dy * sin),
    y: center.y + (dx * sin + dy * cos),
  };
}

export function generateControlHandles(shape: ShapeData): ControlHandle[] {
  if (!shape) return [];

  const handles: ControlHandle[] = [];

  switch (shape.type) {
    case TypeShape.RECT:
    case TypeShape.TEXT: {
      const { x, y, width, height } = shape;
      // Border container rectangle control
      handles.push({
        id: `${shape.id}-container`,
        x,
        y,
        width,
        height,
        editState: EditState.CENTER,
        cursor: 'move',
        type: 'rect',
      });
      // NW
      handles.push({
        id: `${shape.id}-nw`,
        x,
        y,
        editState: EditState.NW_POINT,
        cursor: 'nw-resize',
        type: 'circle',
      });
      // NE
      handles.push({
        id: `${shape.id}-ne`,
        x: x + width,
        y,
        editState: EditState.NE_POINT,
        cursor: 'ne-resize',
        type: 'circle',
      });
      // SW
      handles.push({
        id: `${shape.id}-sw`,
        x,
        y: y + height,
        editState: EditState.SW_POINT,
        cursor: 'sw-resize',
        type: 'circle',
      });
      // SE
      handles.push({
        id: `${shape.id}-se`,
        x: x + width,
        y: y + height,
        editState: EditState.SE_POINT,
        cursor: 'se-resize',
        type: 'circle',
      });
      // W
      handles.push({
        id: `${shape.id}-w`,
        x,
        y: y + height / 2,
        editState: EditState.W_POINT,
        cursor: 'w-resize',
        type: 'circle',
      });
      // N
      handles.push({
        id: `${shape.id}-n`,
        x: x + width / 2,
        y,
        editState: EditState.N_POINT,
        cursor: 'n-resize',
        type: 'circle',
      });
      // S
      handles.push({
        id: `${shape.id}-s`,
        x: x + width / 2,
        y: y + height,
        editState: EditState.S_POINT,
        cursor: 's-resize',
        type: 'circle',
      });
      // E
      handles.push({
        id: `${shape.id}-e`,
        x: x + width,
        y: y + height / 2,
        editState: EditState.E_POINT,
        cursor: 'e-resize',
        type: 'circle',
      });
      break;
    }
    case TypeShape.ELLIPSE: {
      const { cx, cy, rx, ry } = shape;
      const x = cx - rx;
      const y = cy - ry;
      const width = rx * 2;
      const height = ry * 2;
      // Border container
      handles.push({
        id: `${shape.id}-container`,
        x,
        y,
        width,
        height,
        editState: EditState.CENTER,
        cursor: 'move',
        type: 'rect',
      });
      // NW
      handles.push({
        id: `${shape.id}-nw`,
        x,
        y,
        editState: EditState.NW_POINT,
        cursor: 'nw-resize',
        type: 'circle',
      });
      // NE
      handles.push({
        id: `${shape.id}-ne`,
        x: x + width,
        y,
        editState: EditState.NE_POINT,
        cursor: 'ne-resize',
        type: 'circle',
      });
      // SW
      handles.push({
        id: `${shape.id}-sw`,
        x,
        y: y + height,
        editState: EditState.SW_POINT,
        cursor: 'sw-resize',
        type: 'circle',
      });
      // SE
      handles.push({
        id: `${shape.id}-se`,
        x: x + width,
        y: y + height,
        editState: EditState.SE_POINT,
        cursor: 'se-resize',
        type: 'circle',
      });
      // W
      handles.push({
        id: `${shape.id}-w`,
        x,
        y: cy,
        editState: EditState.W_POINT,
        cursor: 'w-resize',
        type: 'circle',
      });
      // N
      handles.push({
        id: `${shape.id}-n`,
        x: cx,
        y,
        editState: EditState.N_POINT,
        cursor: 'n-resize',
        type: 'circle',
      });
      // S
      handles.push({
        id: `${shape.id}-s`,
        x: cx,
        y: y + height,
        editState: EditState.S_POINT,
        cursor: 's-resize',
        type: 'circle',
      });
      // E
      handles.push({
        id: `${shape.id}-e`,
        x: x + width,
        y: cy,
        editState: EditState.E_POINT,
        cursor: 'e-resize',
        type: 'circle',
      });
      break;
    }
    case TypeShape.LINE:
    case TypeShape.ARROW: {
      const { x1, y1, x2, y2 } = shape;
      handles.push({
        id: `${shape.id}-p1`,
        x: x1,
        y: y1,
        editState: EditState.FIRST_POINT,
        cursor: 'move',
        type: 'circle',
      });
      handles.push({
        id: `${shape.id}-p2`,
        x: x2,
        y: y2,
        editState: EditState.DEFAULT,
        cursor: 'move',
        type: 'circle',
      });
      break;
    }
    case TypeShape.POLYLINE: {
      const bbox = getShapeBoundingBox(shape);
      const { x, y, width, height } = bbox;
      // Border container rectangle control
      handles.push({
        id: `${shape.id}-container`,
        x,
        y,
        width,
        height,
        editState: EditState.CENTER,
        cursor: 'move',
        type: 'rect',
      });
      // NW
      handles.push({
        id: `${shape.id}-nw`,
        x,
        y,
        editState: EditState.NW_POINT,
        cursor: 'nw-resize',
        type: 'circle',
      });
      // NE
      handles.push({
        id: `${shape.id}-ne`,
        x: x + width,
        y,
        editState: EditState.NE_POINT,
        cursor: 'ne-resize',
        type: 'circle',
      });
      // SW
      handles.push({
        id: `${shape.id}-sw`,
        x,
        y: y + height,
        editState: EditState.SW_POINT,
        cursor: 'sw-resize',
        type: 'circle',
      });
      // SE
      handles.push({
        id: `${shape.id}-se`,
        x: x + width,
        y: y + height,
        editState: EditState.SE_POINT,
        cursor: 'se-resize',
        type: 'circle',
      });
      // W
      handles.push({
        id: `${shape.id}-w`,
        x,
        y: y + height / 2,
        editState: EditState.W_POINT,
        cursor: 'w-resize',
        type: 'circle',
      });
      // N
      handles.push({
        id: `${shape.id}-n`,
        x: x + width / 2,
        y,
        editState: EditState.N_POINT,
        cursor: 'n-resize',
        type: 'circle',
      });
      // S
      handles.push({
        id: `${shape.id}-s`,
        x: x + width / 2,
        y: y + height,
        editState: EditState.S_POINT,
        cursor: 's-resize',
        type: 'circle',
      });
      // E
      handles.push({
        id: `${shape.id}-e`,
        x: x + width,
        y: y + height / 2,
        editState: EditState.E_POINT,
        cursor: 'e-resize',
        type: 'circle',
      });
      break;
    }
  }

  // Add Rotation handle to ALL shapes
  const center = getShapeCenter(shape);
  const bbox = getShapeBoundingBox(shape);
  const hasFill = Boolean(shape.fill && shape.fill !== 'none' && shape.fill !== 'transparent');

  const rotX = bbox.x + bbox.width / 2;
  const rotY = hasFill ? bbox.y - 25 : center.y;

  handles.push({
    id: `${shape.id}-rotate`,
    x: rotX,
    y: rotY,
    editState: EditState.ROTATE,
    cursor: 'grab',
    type: 'circle',
    stemY: hasFill ? bbox.y : undefined,
  });

  return handles;
}

export function createNewShape(type: TypeShape, startPoint: Point): ShapeData {
  const id = 'shape-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const commonProps = {
    id,
    stroke: 'black',
    fill: type === TypeShape.RECT || type === TypeShape.ELLIPSE ? '#ffffff' : 'none',
    strokeWidth: 1,
    strokeOpacity: 1,
    fillOpacity: 1,
  };

  switch (type) {
    case TypeShape.RECT:
      return {
        ...commonProps,
        type: TypeShape.RECT,
        x: startPoint.x,
        y: startPoint.y,
        width: 0,
        height: 0,
      };
    case TypeShape.ELLIPSE:
      return {
        ...commonProps,
        type: TypeShape.ELLIPSE,
        cx: startPoint.x,
        cy: startPoint.y,
        rx: 0,
        ry: 0,
      };
    case TypeShape.LINE:
      return {
        ...commonProps,
        type: TypeShape.LINE,
        x1: startPoint.x,
        y1: startPoint.y,
        x2: startPoint.x,
        y2: startPoint.y,
      };
    case TypeShape.ARROW:
      return {
        ...commonProps,
        type: TypeShape.ARROW,
        x1: startPoint.x,
        y1: startPoint.y,
        x2: startPoint.x,
        y2: startPoint.y,
        markerStart: false,
        markerEnd: true, // Arrowhead at endpoint by default
      };
    case TypeShape.POLYLINE:
      return {
        ...commonProps,
        type: TypeShape.POLYLINE,
        points: `${startPoint.x},${startPoint.y}`,
      };
    case TypeShape.TEXT:
      return {
        ...commonProps,
        type: TypeShape.TEXT,
        x: startPoint.x,
        y: startPoint.y,
        width: 120,
        height: 40,
        fill: 'none',
        strokeWidth: 0,
        color: '#000000',
        fontSize: 14,
        textAlign: 'left',
        verticalAlign: 'top',
        content: '',
      };
  }
}

export function updateShapePoint(
  shape: ShapeData,
  currentPoint: Point,
  initPoint: Point,
  editState: EditState,
  initialShape?: ShapeData | null
): ShapeData {
  const base = initialShape || shape;
  const rotation = base.rotation || 0;

  // 1. Handle rotation handle interaction
  if (editState === EditState.ROTATE) {
    const center = getShapeCenter(base);
    const initDx = initPoint.x - center.x;
    const initDy = initPoint.y - center.y;
    const initDist = Math.hypot(initDx, initDy);
    const initAngle = initDist > 2 ? Math.atan2(initDy, initDx) * (180 / Math.PI) : -90;

    const currDx = currentPoint.x - center.x;
    const currDy = currentPoint.y - center.y;
    const currAngle = Math.atan2(currDy, currDx) * (180 / Math.PI);

    let deltaAngle = currAngle - initAngle;
    let newRotation = Math.round(((base.rotation || 0) + deltaAngle) % 360);
    if (newRotation < 0) newRotation += 360;

    return { ...shape, rotation: newRotation };
  }

  // 2. Handle shape editing & resizing
  switch (shape.type) {
    case TypeShape.RECT:
    case TypeShape.TEXT: {
      const baseRect = base as RectShape | TextShape;

      // Handle translation (moving shape body)
      if (editState === EditState.CENTER) {
        const dx = currentPoint.x - initPoint.x;
        const dy = currentPoint.y - initPoint.y;
        return {
          ...shape,
          x: baseRect.x + dx,
          y: baseRect.y + dy,
          width: baseRect.width,
          height: baseRect.height,
        };
      }

      // Handle handle resizing (NW, NE, SW, SE, N, S, E, W)
      const oldCenter = getShapeCenter(baseRect);

      // Determine local anchor point (the fixed corner/edge opposite to the dragged handle)
      let localAnchor: Point;
      let resizeWidth = true;
      let resizeHeight = true;

      switch (editState) {
        case EditState.NW_POINT:
          localAnchor = { x: baseRect.x + baseRect.width, y: baseRect.y + baseRect.height };
          break;
        case EditState.NE_POINT:
          localAnchor = { x: baseRect.x, y: baseRect.y + baseRect.height };
          break;
        case EditState.SW_POINT:
          localAnchor = { x: baseRect.x + baseRect.width, y: baseRect.y };
          break;
        case EditState.SE_POINT:
          localAnchor = { x: baseRect.x, y: baseRect.y };
          break;
        case EditState.W_POINT:
          localAnchor = { x: baseRect.x + baseRect.width, y: baseRect.y + baseRect.height / 2 };
          resizeHeight = false;
          break;
        case EditState.E_POINT:
          localAnchor = { x: baseRect.x, y: baseRect.y + baseRect.height / 2 };
          resizeHeight = false;
          break;
        case EditState.N_POINT:
          localAnchor = { x: baseRect.x + baseRect.width / 2, y: baseRect.y + baseRect.height };
          resizeWidth = false;
          break;
        case EditState.S_POINT:
          localAnchor = { x: baseRect.x + baseRect.width / 2, y: baseRect.y };
          resizeWidth = false;
          break;
        default:
          localAnchor = { x: baseRect.x, y: baseRect.y };
          break;
      }

      // Fixed anchor position in world coordinates before resize
      const anchorWorld = rotatePoint(localAnchor, oldCenter, rotation);

      // Un-rotate current mouse point relative to oldCenter
      const localMouse = rotatePoint(currentPoint, oldCenter, -rotation);

      // Compute temporary unrotated bounds
      let tempX = baseRect.x;
      let tempW = baseRect.width;
      let tempY = baseRect.y;
      let tempH = baseRect.height;

      if (resizeWidth) {
        tempX = Math.min(localAnchor.x, localMouse.x);
        tempW = Math.max(10, Math.abs(localAnchor.x - localMouse.x));
      }
      if (resizeHeight) {
        tempY = Math.min(localAnchor.y, localMouse.y);
        tempH = Math.max(10, Math.abs(localAnchor.y - localMouse.y));
      }

      const tempCenter = { x: tempX + tempW / 2, y: tempY + tempH / 2 };

      // Where does localAnchor land when rotated around tempCenter?
      const currentAnchorWorld = rotatePoint(localAnchor, tempCenter, rotation);

      // Shift required to keep anchorWorld fixed in world space
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

    case TypeShape.ELLIPSE: {
      const baseEllipse = base as EllipseShape;

      if (editState === EditState.CENTER) {
        const dx = currentPoint.x - initPoint.x;
        const dy = currentPoint.y - initPoint.y;
        return {
          ...shape,
          cx: baseEllipse.cx + dx,
          cy: baseEllipse.cy + dy,
          rx: baseEllipse.rx,
          ry: baseEllipse.ry,
        };
      }

      // Un-rotate current point around ellipse center
      const center = { x: baseEllipse.cx, y: baseEllipse.cy };
      const localMouse = rotatePoint(currentPoint, center, -rotation);
      const diffX = Math.abs(localMouse.x - center.x);
      const diffY = Math.abs(localMouse.y - center.y);

      let newRx = baseEllipse.rx;
      let newRy = baseEllipse.ry;

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

    case TypeShape.LINE:
    case TypeShape.ARROW: {
      const baseLine = base as LineShape | ArrowShape;

      if (editState === EditState.CENTER) {
        const dx = currentPoint.x - initPoint.x;
        const dy = currentPoint.y - initPoint.y;
        return {
          ...shape,
          x1: baseLine.x1 + dx,
          y1: baseLine.y1 + dy,
          x2: baseLine.x2 + dx,
          y2: baseLine.y2 + dy,
        };
      }

      // Find current world positions of p1 and p2 before handle edit
      const lineCenter = {
        x: (baseLine.x1 + baseLine.x2) / 2,
        y: (baseLine.y1 + baseLine.y2) / 2,
      };
      const p1World = rotatePoint({ x: baseLine.x1, y: baseLine.y1 }, lineCenter, rotation);
      const p2World = rotatePoint({ x: baseLine.x2, y: baseLine.y2 }, lineCenter, rotation);

      if (editState === EditState.FIRST_POINT) {
        // Moving p1: p2 stays fixed at p2World, p1 becomes currentPoint
        return {
          ...shape,
          x1: currentPoint.x,
          y1: currentPoint.y,
          x2: p2World.x,
          y2: p2World.y,
          rotation: 0,
        };
      } else {
        // Moving p2: p1 stays fixed at p1World, p2 becomes currentPoint
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

    case TypeShape.POLYLINE: {
      const basePolyline = base as PolylineShape;

      if (editState === EditState.CENTER) {
        const dx = currentPoint.x - initPoint.x;
        const dy = currentPoint.y - initPoint.y;
        const shiftedPoints = basePolyline.points
          .trim()
          .split(/\s+/)
          .map((p) => {
            const [px, py] = p.split(',').map(Number);
            return `${px + dx},${py + dy}`;
          })
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

      // Handle polyline handle resizing (NW, NE, SW, SE, N, S, E, W)
      const baseBbox = getShapeBoundingBox(basePolyline);
      const oldCenter = getShapeCenter(basePolyline);

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

      const scaledPoints = basePolyline.points
        .trim()
        .split(/\s+/)
        .map((p) => {
          const [px, py] = p.split(',').map(Number);
          const normX = (px - baseBbox.x) / origW;
          const normY = (py - baseBbox.y) / origH;
          const newPx = tempX + (resizeWidth ? normX * tempW : (px - baseBbox.x)) + shiftX;
          const newPy = tempY + (resizeHeight ? normY * tempH : (py - baseBbox.y)) + shiftY;
          return `${newPx.toFixed(2)},${newPy.toFixed(2)}`;
        })
        .join(' ');

      return {
        ...shape,
        points: scaledPoints,
      };
    }
  }
}
