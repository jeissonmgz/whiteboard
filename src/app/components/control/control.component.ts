import { Component, OnInit } from "@angular/core";
import { MouseService } from "src/app/services/mouse.service";
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
    private mouseService: MouseService,
    private viewBoxService: ViewBoxService
  ) {}

  ngOnInit(): void {}

  selectEllipse() {
    this.mouseService.changeShape(new Ellipse());
  }

  selectLine() {
    this.mouseService.changeShape(new Line());
  }

  selectPolyline() {
    this.mouseService.changeShape(new Polyline());
  }

  selectRect() {
    this.mouseService.changeShape(new Rect());
  }

  selectText() {
    this.mouseService.changeShape(new Text());
  }

  zoom(value: boolean | number) {
    this.viewBoxService.change(value, null);
  }
}
