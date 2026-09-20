export enum PropertyAllowed {
  text = 'text',
  background = 'background',
  line = 'line',
}

export enum TypeShape {
  ELLIPSE = 'ellipse',
  LINE = 'line',
  POLYLINE = 'polyline',
  RECT = 'rect',
  TEXT = 'foreignObject',
  ARROW = 'arrow',
}

export enum EditState {
  CENTER = 0,
  N_POINT = 1,
  S_POINT = 2,
  E_POINT = 3,
  W_POINT = 4,
  NE_POINT = 5,
  NW_POINT = 6,
  SE_POINT = 7,
  SW_POINT = 8,
  FIRST_POINT = 9,
  DEFAULT = 10,
}

export interface Point {
  x: number;
  y: number;
}

export interface BaseShape {
  id: string;
  type: TypeShape;
  stroke?: string;
  fill?: string;
  strokeWidth?: string | number;
  strokeOpacity?: string | number;
  fillOpacity?: string | number;
  fontSize?: string | number;
  color?: string;
  opacity?: string | number;
  textAlign?: string;
  verticalAlign?: string;
  markerStart?: boolean;
  markerEnd?: boolean;
}

export interface RectShape extends BaseShape {
  type: TypeShape.RECT;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EllipseShape extends BaseShape {
  type: TypeShape.ELLIPSE;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface LineShape extends BaseShape {
  type: TypeShape.LINE;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ArrowShape extends BaseShape {
  type: TypeShape.ARROW;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PolylineShape extends BaseShape {
  type: TypeShape.POLYLINE;
  points: string;
}

export interface TextShape extends BaseShape {
  type: TypeShape.TEXT;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
}

export type ShapeData =
  | RectShape
  | EllipseShape
  | LineShape
  | ArrowShape
  | PolylineShape
  | TextShape;

export interface ControlHandle {
  id: string;
  x: number;
  y: number;
  editState: EditState;
  cursor: string;
  type: 'circle' | 'rect';
  width?: number;
  height?: number;
}

export interface PropertyState {
  textColor?: string;
  textOpacity?: number;
  textSize?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  lineColor?: string;
  lineOpacity?: number;
  lineWidth?: number;
}
