import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { Shape, State } from "./shapes/shape";
import { Point } from "./shapes/point";
import { Ellipse } from "./shapes/ellipse";

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
    this.shape = shape;
  }

  down(event, point: Point) {
    this.startClick = event.timeStamp;
    this.shape.firstPoint(new Point(point.x, point.y));
    this.shape.stroke = "black";
    this.drawSubject.next(this.shape.element);
    setTimeout(() => this.shape.focus(), 100);
  }

  up(event, point: Point) {
    this.finishClick = event.timeStamp;
    this.shape.lastPoint(point, this.finishClick - this.startClick);
    this.shape.init();
  }

  click(event, point: Point) {}

  move(event, point: Point) {
    if (this.shape.state != State.EDIT) return;
    this.shape.addPoint(new Point(point.x, point.y));
  }

  getDrawSubject(): Observable<any> {
    return this.drawSubject.asObservable();
  }
}
