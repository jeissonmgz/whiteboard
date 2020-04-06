import { Component, OnInit } from "@angular/core";
import { ViewBoxService } from "src/app/services/view-box.service";

@Component({
  selector: "app-scroll",
  templateUrl: "./scroll.component.html",
  styleUrls: ["./scroll.component.sass"],
})
export class ScrollComponent implements OnInit {
  readonly HORIZONTAL = true;
  readonly VERTICAL = false;
  readonly LEFT_OR_UP = true;
  readonly RIGHT_OR_DOWN = false;
  private timerScroll: number;

  constructor(private viewBoxService: ViewBoxService) {}

  ngOnInit(): void {}

  scroll(isHorizontal: boolean, isTopOrLeft: boolean, value: number = 10) {
    this.viewBoxService.change(null, {
      orientation: isHorizontal,
      direction: isTopOrLeft,
      value: value,
    });
  }

  moveScrollPressed(isHorizontal: boolean, isTopOrLeft: boolean) {
    let velocidad: number = 500;
    this.timerScroll = <any>setInterval(() => {
      this.scroll(isHorizontal, isTopOrLeft);
    }, velocidad);
  }

  stopScroll() {
    if (this.timerScroll) {
      clearInterval(this.timerScroll);
    }
  }
}
