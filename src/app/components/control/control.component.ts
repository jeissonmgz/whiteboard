import { Component, OnInit } from "@angular/core";
import { ShapeEventService } from "src/app/services/shape-event.service";
import { Ellipse } from "src/app/services/shapes/ellipse";
import { Line } from "src/app/services/shapes/line";
import { Polyline } from "src/app/services/shapes/polyline";
import { Rect } from "src/app/services/shapes/rect";
import { Text } from "src/app/services/shapes/text";
import { ViewBoxService } from "src/app/services/view-box.service";

@Component({
  selector: "app-control",
  templateUrl: "./control.component.html",
  styleUrls: ["./control.component.sass"],
})
export class ControlComponent implements OnInit {
  readonly ZOOM_IN = true;
  readonly ZOOM_OUT = false;
  readonly ZOOM_100 = 100;

  constructor(
    public shapeEventService: ShapeEventService,
    public viewBoxService: ViewBoxService
  ) {}

  ngOnInit(): void {}

  selectEllipse() {
    this.shapeEventService.changeShape(new Ellipse());
  }

  selectLine() {
    this.shapeEventService.changeShape(new Line());
  }

  selectPolyline() {
    this.shapeEventService.changeShape(new Polyline());
  }

  selectRect() {
    this.shapeEventService.changeShape(new Rect());
  }

  selectText() {
    this.shapeEventService.changeShape(new Text());
  }

  selectShape() {
    this.shapeEventService.changeShape(null);
  }

  zoom(value: boolean | number) {
    this.viewBoxService.change(value, null);
  }
}
