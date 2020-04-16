import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { MatSliderModule } from "@angular/material/slider";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ControlComponent } from "./components/control/control.component";
import { CircleButtonComponent } from "./components/circle-button/circle-button.component";
import { PropertyComponent } from "./components/property/property.component";
import { PageComponent } from "./components/page/page.component";
import { ViewBoxDirective } from "./directives/view-box.directive";
import { ScrollComponent } from "./components/scroll/scroll.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ColorPickerComponent } from "./components/color-picker/color-picker.component";

@NgModule({
  declarations: [
    AppComponent,
    ControlComponent,
    CircleButtonComponent,
    PropertyComponent,
    PageComponent,
    ViewBoxDirective,
    ScrollComponent,
    ColorPickerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSliderModule,
    MatTabsModule,
    MatTooltipModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
