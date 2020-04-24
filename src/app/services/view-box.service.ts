import { Injectable, ElementRef } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { ShapeEventService } from "./shape-event.service";

@Injectable({
  providedIn: "root",
})
export class ViewBoxService {
  private subject = new Subject<any>();
  clearControlSubject = new Subject<any>();

  readonly ZOOM_IN = true;
  readonly ZOOM_OUT = false;

  readonly HORIZONTAL = true;
  readonly VERTICAL = false;
  readonly LEFT_OR_UP = true;
  readonly RIGHT_OR_DOWN = false;

  actualView: ElementRef;
  historialViews: any[];
  deleteViews: any[];

  constructor() {
    this.historialViews = [];
    this.deleteViews = [];
  }

  change(zoom, scroll: { orientation; direction; value }) {
    this.subject.next({ zoom: zoom, scroll: scroll });
  }

  getChanges(): Observable<any> {
    return this.subject.asObservable();
  }

  getClearControlSubject(): Observable<any> {
    return this.clearControlSubject.asObservable();
  }

  saveView() {
    this.historialViews.push(this.actualView.nativeElement.innerHTML);
  }

  undoView() {
    this.clearControlSubject.next();
    this.actualView.nativeElement.getElementById("controls").innerHTML = "";
    this.deleteViews.push(
      this.actualView.nativeElement.getElementById("canvas").innerHTML
    );
    this.actualView.nativeElement.getElementById(
      "canvas"
    ).innerHTML = this.historialViews.pop();
  }

  redoView() {
    this.clearControlSubject.next();
    this.actualView.nativeElement.getElementById("controls").innerHTML = "";
    this.historialViews.push(
      this.actualView.nativeElement.getElementById("canvas").innerHTML
    );
    this.actualView.nativeElement.getElementById(
      "canvas"
    ).innerHTML = this.deleteViews.pop();
  }
}
