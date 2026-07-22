import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DashboardComponent } from './dashboard.component';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { ApexChartsModule } from '../apex-charts/apex-charts.module';
import { CapitalizeFirstPipe } from 'src/app/pipes/capitalize.pipe';
import {
  LucideAngularModule,
  UserCheck,
  BriefcaseBusiness,
  CalendarCheck2,
  Wallet,
  CalendarClock,
  CableCar,
  Gift,
  Landmark,
  ShieldUser,
  LogOut,
} from 'lucide-angular';
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
    DialogModule,
    ButtonModule,
    InputTextareaModule,
    PreloaderModule,
    ApexChartsModule,
    CapitalizeFirstPipe,
    LucideAngularModule.pick({
      UserCheck,
      BriefcaseBusiness,
      CalendarCheck2,
      Wallet,
      CalendarClock,
      CableCar,
      Gift,
      Landmark,
      ShieldUser,
      LogOut,
    }),
  ],
})
export class DashboardModule {}
