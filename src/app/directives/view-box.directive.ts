import { Directive, ElementRef, Renderer2, HostListener } from "@angular/core";
import { Subscription } from "rxjs";
import { ViewBoxService } from "../services/view-box.service";
import { ShapeEventService } from "../services/shape-event.service";
import { MouseService } from "../services/mouse.service";
import { Point } from "../services/shapes/point";

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
  zoom: number = 1;

  viewSubscription: Subscription;
  drawSubscription: Subscription;

  private animation;

  constructor(
    private svg: ElementRef,
    private viewBoxService: ViewBoxService,
    private shapeEventService: ShapeEventService,
    private mouseService: MouseService,
    private renderer2: Renderer2
  ) {
    this.viewSubscription = this.viewBoxService
      .getChanges()
      .subscribe((change) => {
        if (change.scroll) {
          this.scroll(
            change.scroll.orientation,
            change.scroll.direction,
            change.scroll.value
          );
        } else {
          if (change.zoom == 100) {
            this.zoom = 1;
          } else if (change.zoom) {
            if (this.zoom > 0.25) this.zoom -= 0.25;
          } else {
            this.zoom += 0.25;
          }
          this.updateScreen();
        }
      });
    this.drawSubscription = this.shapeEventService
      .getDrawSubject()
      .subscribe((elemenChild) => {
        this.renderer2.appendChild(this.svg.nativeElement, elemenChild);
      });
  }

  ngOnInit() {
    this.animation = this.svg.nativeElement.querySelector("animate");
  }

  @HostListener("window:load", ["$event"])
  onLoad(event) {
    this.svg.nativeElement.viewBox.baseVal.width =
      event.currentTarget.innerWidth;
    this.svg.nativeElement.viewBox.baseVal.height =
      event.currentTarget.innerHeight;
    this.updateScreen();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.svg.nativeElement.viewBox.baseVal.width = event.target.innerWidth;
    this.svg.nativeElement.viewBox.baseVal.height = event.target.innerHeight;
    this.updateScreen();
  }

  @HostListener("click", ["$event"])
  onClick(event) {
    let point = this.getPoint(event);
    this.mouseService.click(event, point);
  }

  @HostListener("mousemove", ["$event"])
  onMouseMove(event) {
    let point = this.getPoint(event);
    this.mouseService.move(event, point);
  }

  @HostListener("mouseup", ["$event"])
  onMouseUp(event) {
    let point = this.getPoint(event);
    this.mouseService.up(event, point);
  }

  @HostListener("mousedown", ["$event"])
  onMouseDown(event) {
    let point = this.getPoint(event);
    this.mouseService.down(event, point);
  }

  getPoint(event): Point {
    let positionSvg = this.svg.nativeElement.getBoundingClientRect();
    return new Point(
      (event.clientX - positionSvg.left) * this.zoom + this.positionActual.x,
      (event.clientY - positionSvg.top) * this.zoom + this.positionActual.y
    );
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
      this.svg.nativeElement.viewBox.baseVal.width * this.zoom +
      " " +
      this.svg.nativeElement.viewBox.baseVal.height * this.zoom
    );
  }

  get viewBoxPreview() {
    return this.viewBox(this.positionPreview);
  }

  get viewBoxActual() {
    return this.viewBox(this.positionActual);
  }
}
