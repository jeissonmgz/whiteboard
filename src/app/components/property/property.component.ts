import { Component, OnInit } from "@angular/core";

export class Property {
  backgroundColor: string;
  backgroundOpacity: number = 1;
  lineColor: string;
  lineOpacity: number;
  lineWidth: number = 1;
}
export enum PropertyAllowed {
  backgroundColor,
  backgroundOpacity,
  lineColor,
  lineOpacity,
  lineWidth,
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
}
