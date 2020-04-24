import { Component, OnInit } from "@angular/core";
import { Property } from "../../services/shapes/properties/property";
import { PropertyAllowed } from "../../services/shapes/properties/properties-allowed";
import { ShapeEventService } from "src/app/services/shape-event.service";

@Component({
  selector: "app-property",
  templateUrl: "./property.component.html",
  styleUrls: ["./property.component.sass"],
})
export class PropertyComponent implements OnInit {
  readonly propertiesAllowed = PropertyAllowed;
  constructor(public shapeEventService: ShapeEventService) {}

  ngOnInit(): void {}
  formatPercentageLabel(value: number) {
    return Math.round(value * 100) + "%";
  }
  updateText(event) {
    this.shapeEventService.shape.color = event.color;
    this.shapeEventService.shape.opacity = event.opacity;
    this.shapeEventService.property.textColor = event.color;
    this.shapeEventService.property.textOpacity = event.opacity;
  }
  updateFill(event) {
    this.shapeEventService.shape.fill = event.color;
    this.shapeEventService.shape.fillOpacity = event.opacity;
    this.shapeEventService.property.backgroundColor = event.color;
    this.shapeEventService.property.backgroundOpacity = event.opacity;
  }
  updateStroke(event) {
    this.shapeEventService.shape.stroke = event.color;
    this.shapeEventService.shape.strokeOpacity = event.opacity;
    this.shapeEventService.property.lineColor = event.color;
    this.shapeEventService.property.lineOpacity = event.opacity;
  }
  setVisibleStroke(event) {
    this.shapeEventService.shape.stroke = event.checked ? "#000000" : "none";
  }
  setVisibleFill(event) {
    this.shapeEventService.shape.fill = event.checked ? "#ffffff" : "none";
  }
}
