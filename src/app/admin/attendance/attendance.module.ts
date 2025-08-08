import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { AttendanceComponent } from './attendance.component';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { CapitalizeFirstPipe } from 'src/app/pipes/capitalize.pipe';

const routes: Routes = [
  { path: '', component: AttendanceComponent },
  {
    path: 'create',
    loadChildren: () =>
      import('./create/create.module').then((m) => m.CreateModule),
  },
  {
    path: 'update/:id',
    loadChildren: () =>
      import('./create/create.module').then((m) => m.CreateModule),
  },
  {
    path: 'view/:id',
    loadChildren: () => import('./view/view.module').then((m) => m.ViewModule),
  },
  {
    path: 'monthattendance',
    loadChildren: () =>
      import('./monthattendance/monthattendance.module').then(
        (m) => m.MonthattendanceModule
      ),
  },
];
@NgModule({
  declarations: [AttendanceComponent],
  imports: [
    CommonModule,
    FormsModule,
    [RouterModule.forChild(routes)],
    BreadcrumbModule,
    TableModule,
    MenuModule,
    ButtonModule,
    DropdownModule,
    DialogModule,
    InputTextModule,
    CalendarModule,
    LazyLoadImageModule,
    PreloaderModule,
    CapitalizeFirstPipe,
  ],
})
export class AttendanceModule {}
