import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppComponent } from './app.component';
import {ScenesComponent} from "./scenes/scenes.component";
import {TransportComponent} from "./transport/transport.component";
import {EffectsComponent} from "./effects/effects.component";
import {
  NgxBootstrapIconsModule,
  pauseFill,
  playFill,
  bootstrapReboot,
  forwardFill,
  gearFill,
  exclamationCircleFill,
  arrowRepeat
} from 'ngx-bootstrap-icons';
import {NgbModule, NgbProgressbarModule} from "@ng-bootstrap/ng-bootstrap";
import { SettingsComponent } from './settings/settings.component';
import { LayersComponent } from './layers/layers.component';

const icons = { pauseFill, playFill, bootstrapReboot, forwardFill, gearFill, exclamationCircleFill, arrowRepeat};

@NgModule({
  declarations: [
    AppComponent,
    ScenesComponent,
    TransportComponent,
    EffectsComponent,
    SettingsComponent,
    LayersComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgbModule,
    NgbProgressbarModule,
    NgxBootstrapIconsModule.forRoot(icons),
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
