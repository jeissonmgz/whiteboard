import { ShapeData, TypeShape, PropertyAllowed, ControlHandle, EditState, Point } from '../../types/shape';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ShapeStrategy<T extends ShapeData = ShapeData> {
  type: TypeShape;
  getPropertiesAllowed(): PropertyAllowed[];
  getCenter(shape: T): Point;
  getBoundingBox(shape: T): BoundingBox;
  generateControlHandles(shape: T): ControlHandle[];
  createShape(id: string, startPoint: Point): T;
  updateShapePoint(
    shape: T,
    currentPoint: Point,
    initPoint: Point,
    editState: EditState,
    initialShape?: T | null
  ): T;
}
