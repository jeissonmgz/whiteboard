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
      // Polyline has no handles in original app
      break;
    }
  }

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
  const dx = currentPoint.x - initPoint.x;
  const dy = currentPoint.y - initPoint.y;
  const base = initialShape || shape;

  switch (shape.type) {
    case TypeShape.RECT:
    case TypeShape.TEXT: {
      const baseRect = base as RectShape | TextShape;
      const diffX = Math.abs(currentPoint.x - initPoint.x);
      const diffY = Math.abs(currentPoint.y - initPoint.y);

      let newX = shape.x;
      let newY = shape.y;
      let newW = shape.width;
      let newH = shape.height;

      switch (editState) {
        case EditState.CENTER:
          newX = baseRect.x + dx;
          newY = baseRect.y + dy;
          newW = baseRect.width;
          newH = baseRect.height;
          break;
        case EditState.W_POINT:
        case EditState.E_POINT:
          newX = Math.min(initPoint.x, currentPoint.x);
          newW = diffX;
          break;
        case EditState.N_POINT:
        case EditState.S_POINT:
          newY = Math.min(initPoint.y, currentPoint.y);
          newH = diffY;
          break;
        default:
          newX = Math.min(initPoint.x, currentPoint.x);
          newY = Math.min(initPoint.y, currentPoint.y);
          newW = diffX;
          newH = diffY;
          break;
      }
      return { ...shape, x: newX, y: newY, width: newW, height: newH };
    }
    case TypeShape.ELLIPSE: {
      const baseEllipse = base as EllipseShape;
      const diffX = Math.abs(currentPoint.x - shape.cx);
      const diffY = Math.abs(currentPoint.y - shape.cy);

      let newCx = shape.cx;
      let newCy = shape.cy;
      let newRx = shape.rx;
      let newRy = shape.ry;

      switch (editState) {
        case EditState.CENTER:
          newCx = baseEllipse.cx + dx;
          newCy = baseEllipse.cy + dy;
          newRx = baseEllipse.rx;
          newRy = baseEllipse.ry;
          break;
        case EditState.W_POINT:
        case EditState.E_POINT:
          newRx = diffX;
          break;
        case EditState.N_POINT:
        case EditState.S_POINT:
          newRy = diffY;
          break;
        default:
          newRx = diffX;
          newRy = diffY;
          break;
      }
      return { ...shape, cx: newCx, cy: newCy, rx: newRx, ry: newRy };
    }
    case TypeShape.LINE:
    case TypeShape.ARROW: {
      const baseLine = base as LineShape | ArrowShape;
      if (editState === EditState.CENTER) {
        return {
          ...shape,
          x1: baseLine.x1 + dx,
          y1: baseLine.y1 + dy,
          x2: baseLine.x2 + dx,
          y2: baseLine.y2 + dy,
        };
      } else if (editState === EditState.FIRST_POINT) {
        return { ...shape, x1: currentPoint.x, y1: currentPoint.y };
      } else {
        return { ...shape, x2: currentPoint.x, y2: currentPoint.y };
      }
    }
    case TypeShape.POLYLINE: {
      const basePolyline = base as PolylineShape;
      if (editState === EditState.CENTER) {
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
      return {
        ...shape,
        points: shape.points + ` ${currentPoint.x},${currentPoint.y}`,
      };
    }
  }
}
