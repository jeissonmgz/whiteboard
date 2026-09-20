import { Point, ControlHandle, EditState, ShapeData } from '../../../types/shape';
import { BoundingBox } from '../types';

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

export function getBoundingBoxHandles(shapeId: string, bbox: BoundingBox): ControlHandle[] {
  const { x, y, width, height } = bbox;
  return [
    {
      id: `${shapeId}-container`,
      x,
      y,
      width,
      height,
      editState: EditState.CENTER,
      cursor: 'move',
      type: 'rect',
    },
    {
      id: `${shapeId}-nw`,
      x,
      y,
      editState: EditState.NW_POINT,
      cursor: 'nw-resize',
      type: 'circle',
    },
    {
      id: `${shapeId}-ne`,
      x: x + width,
      y,
      editState: EditState.NE_POINT,
      cursor: 'ne-resize',
      type: 'circle',
    },
    {
      id: `${shapeId}-sw`,
      x,
      y: y + height,
      editState: EditState.SW_POINT,
      cursor: 'sw-resize',
      type: 'circle',
    },
    {
      id: `${shapeId}-se`,
      x: x + width,
      y: y + height,
      editState: EditState.SE_POINT,
      cursor: 'se-resize',
      type: 'circle',
    },
    {
      id: `${shapeId}-w`,
      x,
      y: y + height / 2,
      editState: EditState.W_POINT,
      cursor: 'w-resize',
      type: 'circle',
    },
    {
      id: `${shapeId}-n`,
      x: x + width / 2,
      y,
      editState: EditState.N_POINT,
      cursor: 'n-resize',
      type: 'circle',
    },
    {
      id: `${shapeId}-s`,
      x: x + width / 2,
      y: y + height,
      editState: EditState.S_POINT,
      cursor: 's-resize',
      type: 'circle',
    },
    {
      id: `${shapeId}-e`,
      x: x + width,
      y: y + height / 2,
      editState: EditState.E_POINT,
      cursor: 'e-resize',
      type: 'circle',
    },
  ];
}

export function getRotationHandle(shape: ShapeData, center: Point, bbox: BoundingBox): ControlHandle {
  const hasFill = Boolean(shape.fill && shape.fill !== 'none' && shape.fill !== 'transparent');
  const rotX = bbox.x + bbox.width / 2;
  const rotY = hasFill ? bbox.y - 25 : center.y;

  return {
    id: `${shape.id}-rotate`,
    x: rotX,
    y: rotY,
    editState: EditState.ROTATE,
    cursor: 'grab',
    type: 'circle',
    stemY: hasFill ? bbox.y : undefined,
  };
}
