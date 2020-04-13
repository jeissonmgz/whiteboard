import { Injectable, ElementRef } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { Shape, State, EditState, TypeShape } from "./shapes/shape";
import { Point } from "./shapes/point";
import { ShapeFactory } from "./shapes/shape-factory";

@Injectable({
  providedIn: "root",
})
export class ShapeEventService {
  drawSubject = new Subject<any>();
  shape: Shape;
  startClick: number = 0;
  finishClick: number;
  isSelectShape: boolean;
  typeShape: TypeShape;
  shapeSelected: TypeShape;

  constructor() {
    this.changeShape(null);
  }

  resetChanges() {
    if (this.shape != null) {
      this.shape.removeControlsEdit();
      this.shape.editState = EditState.DEFAULT;
    }
  }

  changeShape(shape: Shape) {
    this.resetChanges();
    this.isSelectShape = shape == null;
    this.typeShape = this.isSelectShape
      ? null
      : (this.typeShape = ShapeFactory.getTypeShape(shape.element.tagName));
    this.shape = shape;
  }

  beginCreate(event, point: Point) {
    this.startClick = event.timeStamp;
    this.shape.init();
    this.shape.firstPoint(new Point(point.x, point.y));
    this.shape.stroke = "black";
    this.drawSubject.next(this.shape.element);
    setTimeout(() => this.shape.focus(), 100);
  }

  finishCreate(event, point: Point) {}

  beginEdit(event, point: Point) {}

  finishEdit(event, point: Point) {
    this.finishClick = event.timeStamp;
    this.shape.lastPoint(point, this.finishClick - this.startClick);
    this.shape.state = State.FINISH;
    let controls = this.shape.generateControlsEdit();
    controls.forEach((control) => {
      this.drawSubject.next(control.element);
    });
  }

  addPoint(event, point: Point) {
    this.shape.editPoint(new Point(point.x, point.y));
  }

  getDrawSubject(): Observable<any> {
    return this.drawSubject.asObservable();
  }
}
