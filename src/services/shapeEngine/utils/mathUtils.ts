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

export function getBoundingBoxHandles(shapeId: string, bbox: BoundingBox, padding: number = 0): ControlHandle[] {
  const { x, y, width, height } = bbox;
  const p = padding;
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
      x: x - p,
      y: y - p,
      editState: EditState.NW_POINT,
      cursor: 'nw-resize',
      type: 'circle',
    },
    {
      id: `${shapeId}-ne`,
      x: x + width + p,
      y: y - p,
      editState: EditState.NE_POINT,
      cursor: 'ne-resize',
      type: 'circle',
    },
    {
      id: `${shapeId}-sw`,
      x: x - p,
      y: y + height + p,
      editState: EditState.SW_POINT,
      cursor: 'sw-resize',
      type: 'circle',
    },
    {
      id: `${shapeId}-se`,
      x: x + width + p,
      y: y + height + p,
      editState: EditState.SE_POINT,
      cursor: 'se-resize',
      type: 'circle',
    },
    {
      id: `${shapeId}-w`,
      x: x - p,
      y: y + height / 2,
      editState: EditState.W_POINT,
      cursor: 'w-resize',
      type: 'circle',
    },
    {
      id: `${shapeId}-n`,
      x: x + width / 2,
      y: y - p,
      editState: EditState.N_POINT,
      cursor: 'n-resize',
      type: 'circle',
    },
    {
      id: `${shapeId}-s`,
      x: x + width / 2,
      y: y + height + p,
      editState: EditState.S_POINT,
      cursor: 's-resize',
      type: 'circle',
    },
    {
      id: `${shapeId}-e`,
      x: x + width + p,
      y: y + height / 2,
      editState: EditState.E_POINT,
      cursor: 'e-resize',
      type: 'circle',
    },
  ];
}

export function getRotationHandle(shape: ShapeData, center: Point, bbox: BoundingBox): ControlHandle {
  const rotX = bbox.x + bbox.width / 2;
  const rotY = bbox.y - 25;

  return {
    id: `${shape.id}-rotate`,
    x: rotX,
    y: rotY,
    editState: EditState.ROTATE,
    cursor: 'grab',
    type: 'circle',
    stemY: bbox.y,
  };
}
