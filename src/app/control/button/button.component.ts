import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.sass']
})
export class ButtonComponent implements OnInit {

  @Input() icon;
  @Input() rotateIcon = "";
  @Input() isFloat: boolean = false;
  @Input() position: string = '';
  buttonStyle:string = "circle-link";

  constructor() { }

  ngOnInit(): void {
    if(this.isFloat) {
      this.buttonStyle += " float " + this.position;
    } else {
      this.buttonStyle += " move-hover";
    }
  }

}
