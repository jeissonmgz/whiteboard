import { Directive, ElementRef, Renderer2, HostListener } from "@angular/core";
import { Subscription } from "rxjs";
import { ViewBoxService } from "../services/view-box.service";

@Directive({
  selector: "[appViewBox]",
})
export class ViewBoxDirective {
  private positionPreview = {
    x: 0,
    y: 0,
  };
  private positionActual = {
    x: 0,
    y: 0,
  };
  myViewBox: string;

  subscription: Subscription;

  private animation;

  constructor(
    private svg: ElementRef,
    private viewBoxService: ViewBoxService,
    private renderer2: Renderer2
  ) {
    this.subscription = this.viewBoxService.getChanges().subscribe((change) => {
      if (change.scroll) {
        this.scroll(
          change.scroll.orientation,
          change.scroll.direction,
          change.scroll.value
        );
      }
    });
  }

  ngOnInit() {
    this.animation = this.svg.nativeElement.querySelector("animate");
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.svg.nativeElement.viewBox.baseVal.width = event.target.innerWidth;
    this.svg.nativeElement.viewBox.baseVal.height = event.target.innerHeight;
    this.updateScreen();
  }

  applyScroll(isHorizontal: boolean, isTopOrLeft: boolean, value: number) {
    value = value / 100;
    if (isHorizontal) {
      this.positionActual.x +=
        (isTopOrLeft ? -value : value) *
        this.svg.nativeElement.width.baseVal.value;
    } else {
      this.positionActual.y +=
        (isTopOrLeft ? -value : value) *
        this.svg.nativeElement.height.baseVal.value;
    }
  }

  updateScreen() {
    this.myViewBox = this.viewBoxPreview + ";" + this.viewBoxActual;
    this.renderer2.setAttribute(this.animation, "values", this.myViewBox);
    this.animation.beginElement();
  }

  scroll(isHorizontal: boolean, isTopOrLeft: boolean, value: number) {
    this.positionPreview = { ...this.positionActual };
    this.applyScroll(isHorizontal, isTopOrLeft, value);
    this.updateScreen();
  }

  viewBox(position) {
    return (
      position.x +
      " " +
      position.y +
      " " +
      this.svg.nativeElement.viewBox.baseVal.width +
      " " +
      this.svg.nativeElement.viewBox.baseVal.height
    );
  }

  get viewBoxPreview() {
    return this.viewBox(this.positionPreview);
  }

  get viewBoxActual() {
    return this.viewBox(this.positionActual);
  }
}
