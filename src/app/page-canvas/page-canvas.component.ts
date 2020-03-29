import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-page-canvas',
  templateUrl: './page-canvas.component.html',
  styleUrls: ['./page-canvas.component.sass']
})
export class PageCanvasComponent implements OnInit {

  readonly HORIZONTAL = true;
  readonly VERTICAL = false;
  readonly LEFT_OR_UP = true;
  readonly RIGHT_OR_DOWN = false;

  @ViewChild("canvas") canvas: ElementRef;
  @ViewChild("animation") animation: ElementRef;
  private positionPreview = {
    x: 0,
    y: 0
  };
  private positionActual = {
    x: 0,
    y: 0
  };
  myViewBox:string;
  private firstClick = false;
  private timerScroll: number;


  constructor() { }

  ngOnInit(): void {
  }

  applyScroll(isHorizontal:boolean, isTopOrLeft: boolean, value: number) {
    if (isHorizontal) {
      this.positionActual.x+= isTopOrLeft?-value:value;
    } else  {
      this.positionActual.y+= isTopOrLeft?-value:value;
    }
  }

  scroll(isHorizontal: boolean, isTopOrLeft: boolean, value: number = 10) {
    this.positionPreview = {...this.positionActual};
    this.firstClick = true;
    this.applyScroll(isHorizontal, isTopOrLeft, value);
    this.myViewBox = (this.viewBoxPreview + ';' + this.viewBoxActual);
    this.animation.nativeElement.beginElement();
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

  viewBox(position) {
    return position.x + ' '+
      position.y + ' '+
      this.canvas.nativeElement.viewBox.baseVal.width + ' ' +
      this.canvas.nativeElement.viewBox.baseVal.height
  }

  get viewBoxPreview() {
    return this.viewBox(this.positionPreview);
  }

  get viewBoxActual() {
    return this.viewBox(this.positionActual);
  }

}
