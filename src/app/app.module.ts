import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSliderModule } from '@angular/material/slider';
import { ControlComponent } from './control/control.component';
import { ButtonComponent } from './control/button/button.component';
import { PropertyComponent } from './property/property.component';

@NgModule({
  declarations: [
    AppComponent,
    ControlComponent,
    ButtonComponent,
    PropertyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSliderModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
