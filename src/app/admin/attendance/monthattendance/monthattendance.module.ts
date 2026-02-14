import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { MonthattendanceComponent } from './monthattendance.component';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { CapitalizeFirstPipe } from 'src/app/pipes/capitalize.pipe';
import {LucideAngularModule,
  Eye,
  UserCheck,
  UserRoundX,
  Sun,
  CalendarClock,
  Timer 
} from 'lucide-angular';
const routes: Routes = [{ path: '', component: MonthattendanceComponent }];

@NgModule({
  declarations: [MonthattendanceComponent],
  imports: [
    CommonModule,
    FormsModule,
    [RouterModule.forChild(routes)],
    BreadcrumbModule,
    InputTextModule,
    CalendarModule,
    TableModule,
    PreloaderModule,
    CapitalizeFirstPipe,
    LucideAngularModule.pick({ 
      Eye,
      UserCheck,
      UserRoundX,
      Sun,
      CalendarClock ,
      Timer 
    })
  ],
})
export class MonthattendanceModule {}
