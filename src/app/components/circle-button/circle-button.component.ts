import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-circle-button",
  templateUrl: "./circle-button.component.html",
  styleUrls: ["./circle-button.component.sass"],
})
export class CircleButtonComponent implements OnInit {
  @Input() icon;
  @Input() info;
  @Input() rotateIcon = "";
  @Input() isFloat: boolean = false;
  @Input() position: string = "";
  @Input() isSelected: boolean = false;
  buttonStyle: string = "circle-link";

  constructor() {}

  ngOnInit(): void {
    if (this.isFloat) {
      this.buttonStyle += " float " + this.position;
    } else {
      this.buttonStyle += " move-hover";
    }
  }

  getColor(): string {
    if (this.isFloat) return "primary";
    if (this.isSelected) return "accent";
    return "primary";
  }
}
