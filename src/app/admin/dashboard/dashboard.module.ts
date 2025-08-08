import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { DashboardComponent } from './dashboard.component';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { ApexChartsModule } from '../apex-charts/apex-charts.module';
import { CapitalizeFirstPipe } from 'src/app/pipes/capitalize.pipe';

const routes: Routes = [{ path: '', component: DashboardComponent }];

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    [RouterModule.forChild(routes)],
    CalendarModule,
    LazyLoadImageModule,
    SkeletonModule,
    TableModule,
    PreloaderModule,
    ApexChartsModule,
    CapitalizeFirstPipe,
  ],
})
export class DashboardModule {}
