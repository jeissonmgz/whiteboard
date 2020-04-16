import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-color-picker",
  templateUrl: "./color-picker.component.html",
  styleUrls: ["./color-picker.component.sass"],
})
export class ColorPickerComponent implements OnInit {
  colors: string[][];
  @Input() color: string;
  @Input() opacity: number;
  @Output() onChange = new EventEmitter<any>();
  constructor() {
    this.colors = [
      [
        "#000000",
        "#9e9e9e",
        "#fafafa",
        "#f5f5f5",
        "#eeeeee",
        "#e0e0e0",
        "#bdbdbd",
        "#757575",
        "#616161",
        "#212121",
        "#ffffff",
      ], //Negro
      [
        "#2196F3",
        "#0091ea",
        "#e3f2fd",
        "#bbdefb",
        "#90caf9",
        "#64b5f6",
        "#42a5f5",
        "#1e88e5",
        "#1976d2",
        "#1565c0",
        "#0d47a1",
      ], //Azul
      [
        "#4CAF50",
        "#00c853",
        "#e8f5e9",
        "#c8e6c9",
        "#a5d6a7",
        "#81c784",
        "#66bb6a",
        "#43a047",
        "#388e3c",
        "#2e7d32",
        "#1b5e20",
      ], //Verde
      [
        "#ffeb3b",
        "#ffea00",
        "#fffde7",
        "#fff9c4",
        "#fff59d",
        "#fff176",
        "#ffee58",
        "#fdd835",
        "#fbc02d",
        "#f9a825",
        "#f57f17",
      ], //Amarillo
      [
        "#ff5722",
        "#ff3d00",
        "#fbe9e7",
        "#ffccbc",
        "#ffab91",
        "#ff8a65",
        "#ff7043",
        "#f4511e",
        "#e64a19",
        "#d84315",
        "#bf360c",
      ], //Naranja
      [
        "#f44336",
        "#d50000",
        "#ffebee",
        "#ffcdd2",
        "#ef9a9a",
        "#e57373",
        "#ef5350",
        "#e53935",
        "#d32f2f",
        "#c62828",
        "#b71c1c",
      ], //Rojo
      [
        "#e91e63",
        "#f50057",
        "#fce4ec",
        "#f8bbd0",
        "#f48fb1",
        "#f06292",
        "#ec407a",
        "#d81b60",
        "#c2185b",
        "#ad1457",
        "#880e4f",
      ], //Rosa
      [
        "#9c27b0",
        "#6200ea",
        "#f3e5f5",
        "#e1bee7",
        "#ce93d8",
        "#ba68c8",
        "#ab47bc",
        "#8e24aa",
        "#7b1fa2",
        "#6a1b9a",
        "#4a148c",
      ], //Violeta
      [
        "#795548",
        "#827717",
        "#efebe9",
        "#d7ccc8",
        "#bcaaa4",
        "#a1887f",
        "#8d6e63",
        "#6d4c41",
        "#5d4037",
        "#4e342e",
        "#3e2723",
      ], //Cafe
    ];
  }

  ngOnInit(): void {}
  updateColor(color) {
    this.color = color;
    this.sendValues();
  }
  updateOpacity(opacity) {
    this.opacity = opacity;
    this.sendValues();
  }
  sendValues() {
    this.onChange.emit({ color: this.color, opacity: this.opacity });
  }
  formatPercentageLabel(value: number) {
    return Math.round(value * 100) + "%";
  }
}
