import { Component, OnInit } from "@angular/core";

export class Property {
  textColor: string;
  textOpacity: number;
  textSize: number = 20;
  backgroundColor: string;
  backgroundOpacity: number = 1;
  lineColor: string;
  lineOpacity: number;
  lineWidth: number = 1;
}
export enum PropertyAllowed {
  text,
  background,
  line,
}

@Component({
  selector: "app-property",
  templateUrl: "./property.component.html",
  styleUrls: ["./property.component.sass"],
})
export class PropertyComponent implements OnInit {
  property: Property;
  constructor() {
    this.property = new Property();
  }

  ngOnInit(): void {}
  formatPercentageLabel(value: number) {
    return Math.round(value * 100) + "%";
  }
  updateText(event) {
    this.property.textColor = event.color;
    this.property.textOpacity = event.opacity;
  }
  updateFill(event) {
    this.property.backgroundColor = event.color;
    this.property.backgroundOpacity = event.opacity;
  }
  updateStroke(event) {
    this.property.lineColor = event.color;
    this.property.lineOpacity = event.opacity;
  }
}
