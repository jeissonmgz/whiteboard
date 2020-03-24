import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.sass']
})
export class ButtonComponent implements OnInit {

  @Input() icon;
  @Input() rotateIcon = "";
  constructor() { }

  ngOnInit(): void {
  }

}
