import { Component, OnInit } from "@angular/core";
import { MouseService } from "src/app/services/mouse.service";
import { Ellipse } from "src/app/services/shapes/ellipse";
import { Line } from "src/app/services/shapes/line";
import { Polyline } from "src/app/services/shapes/polyline";
import { Rect } from "src/app/services/shapes/rect";
import { Text } from "src/app/services/shapes/text";

@Component({
  selector: "app-control",
  templateUrl: "./control.component.html",
  styleUrls: ["./control.component.sass"],
})
export class ControlComponent implements OnInit {
  constructor(private mouseService: MouseService) {}

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
}
