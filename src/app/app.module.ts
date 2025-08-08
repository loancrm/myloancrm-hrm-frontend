import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { JwtModule } from "@auth0/angular-jwt";
import { SessionStorageService } from "./services/session-storage.service";
import { ExtendhttpInterceptor } from "./extendhttp.interceptor";
import { LocationStrategy, HashLocationStrategy } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ToastModule } from "primeng/toast";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ServiceMeta } from "./services/service-meta";
import { LocalStorageService } from "./services/local-storage.service";
import { ToastService } from "./services/toast.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NotFoundModule } from "./not-found/not-found.module";
import { HomeModule } from "./home/home.module";

export function tokenGetter() {
  return localStorage.getItem("access_token");
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastModule,
    HttpClientModule,
    ConfirmDialogModule,
    NotFoundModule,
    HomeModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter
      }
    })
  ],
  providers: [
    LocalStorageService,
    SessionStorageService,
    ServiceMeta,
    ToastService,
    MessageService,
    DialogService,
    ConfirmationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ExtendhttpInterceptor,
      multi: true
    },
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
