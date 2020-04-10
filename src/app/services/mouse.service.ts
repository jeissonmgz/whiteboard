import { Injectable, ElementRef } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { Shape, State, EditState } from "./shapes/shape";
import { Point } from "./shapes/point";
import { Ellipse } from "./shapes/ellipse";
import { ShapeButton } from "./shapes/controls/shape-button";

@Injectable({
  providedIn: "root",
})
export class MouseService {
  drawSubject = new Subject<any>();
  shape: Shape;
  startClick: number = 0;
  finishClick: number;
  constructor() {
    this.changeShape(new Ellipse());
  }

  changeShape(shape: Shape) {
    if (this.shape) {
      this.shape.removeControlsEdit();
      this.shape.editState = EditState.DEFAULT;
    }
    this.shape = shape;
  }

  down(event, point: Point) {
    if (event.target.hasAttributeNS(null, "secundary")) {
      this.shape.state = State.EDIT;
      this.shape.removeControlsEdit();
      this.shape.editState = Number(event.target.getAttributeNS(null, "state"));
      return;
    }
    this.startClick = event.timeStamp;
    this.shape.init();
    this.shape.firstPoint(new Point(point.x, point.y));
    this.shape.stroke = "black";
    this.drawSubject.next(this.shape.element);
    setTimeout(() => this.shape.focus(), 100);
  }

  up(event, point: Point) {
    this.finishClick = event.timeStamp;
    this.shape.lastPoint(point, this.finishClick - this.startClick);
    this.shape.state = State.FINISH;
    let controls: ShapeButton[] = this.shape.generateControlsEdit();
    controls.forEach((control) => {
      this.drawSubject.next(control.element);
    });
  }

  click(event, point: Point) {}

  move(event, point: Point) {
    if (this.shape.state != State.EDIT) return;
    this.shape.editPoint(new Point(point.x, point.y));
  }

  getDrawSubject(): Observable<any> {
    return this.drawSubject.asObservable();
  }
}
