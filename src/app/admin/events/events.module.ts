import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { EventsComponent } from './events.component';
import { PreloaderModule } from 'src/app/preloader/preloader.module';

const routes: Routes = [{ path: '', component: EventsComponent }];

@NgModule({
  declarations: [EventsComponent],
  imports: [
    CommonModule,
    [RouterModule.forChild(routes)],
    FullCalendarModule,
    BreadcrumbModule,
    LazyLoadImageModule,
    PreloaderModule,
  ],
})
export class EventsModule {}
