import {
  ShapeData,
  TypeShape,
  PropertyAllowed,
  EditState,
  ControlHandle,
  Point,
} from '../types/shape';
import { ShapeEngineFactory } from './shapeEngine/ShapeEngineFactory';
import { BoundingBox } from './shapeEngine/types';
import { rotatePoint } from './shapeEngine/utils/mathUtils';
import { getGroupBoundingBox, generateGroupControlHandles, updateGroupShapes } from './shapeEngine/utils/groupUtils';

export { rotatePoint, getGroupBoundingBox, generateGroupControlHandles, updateGroupShapes };

export function getPropertiesAllowed(typeShape: TypeShape): PropertyAllowed[] {
  const strategy = ShapeEngineFactory.getStrategy(typeShape);
  return strategy.getPropertiesAllowed();
}

export function getShapeCenter(shape: ShapeData): Point {
  if (!shape) return { x: 0, y: 0 };
  const strategy = ShapeEngineFactory.getStrategy(shape.type);
  return strategy.getCenter(shape);
}

export function getShapeBoundingBox(shape: ShapeData): BoundingBox {
  if (!shape) return { x: 0, y: 0, width: 0, height: 0 };
  const strategy = ShapeEngineFactory.getStrategy(shape.type);
  return strategy.getBoundingBox(shape);
}

export function generateControlHandles(shape: ShapeData): ControlHandle[] {
  if (!shape) return [];
  const strategy = ShapeEngineFactory.getStrategy(shape.type);
  return strategy.generateControlHandles(shape);
}

export function createNewShape(type: TypeShape, startPoint: Point): ShapeData {
  const id = 'shape-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const strategy = ShapeEngineFactory.getStrategy(type);
  return strategy.createShape(id, startPoint);
}

export function updateShapePoint(
  shape: ShapeData,
  currentPoint: Point,
  initPoint: Point,
  editState: EditState,
  initialShape?: ShapeData | null
): ShapeData {
  const base = initialShape || shape;

  // Handle ROTATE edit state at facade level for all shapes
  if (editState === EditState.ROTATE) {
    const strategy = ShapeEngineFactory.getStrategy(base.type);
    const center = strategy.getCenter(base);
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

  const strategy = ShapeEngineFactory.getStrategy(shape.type);
  return strategy.updateShapePoint(shape, currentPoint, initPoint, editState, initialShape);
}
