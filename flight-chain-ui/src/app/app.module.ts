import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {FlightChainComponent} from './flight-chain/flight-chain.component';
import {AppMaterialModule} from "./app-material.module";
import {AppRoutingModule} from './app-routing.module';
import {FlightChainService} from "./flight-chain/flight-chain.service";
import {HttpClientModule} from "@angular/common/http";
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

@NgModule({
  declarations: [
    AppComponent,
    FlightChainComponent
  ],

  imports: [
    HttpClientModule,
    BrowserModule,
    AppMaterialModule,
    AppRoutingModule,
    LoggerModule.forRoot({serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.OFF})
  ],
  providers: [FlightChainService ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
