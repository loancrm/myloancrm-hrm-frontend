import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ReportsComponent } from './reports.component';
import { PreloaderModule } from 'src/app/preloader/preloader.module';

const routes: Routes = [
  { path: '', component: ReportsComponent },
  {
    path: 'create',
    loadChildren: () =>
      import('./create/create.module').then((m) => m.CreateModule),
  },
  {
    path: 'report-list',
    loadChildren: () =>
      import('./report-list/report-list.module').then(
        (m) => m.ReportListModule
      ),
  },
];

@NgModule({
  declarations: [ReportsComponent],
  imports: [
    CommonModule,
    [RouterModule.forChild(routes)],
    BreadcrumbModule,
    ButtonModule,
    PreloaderModule,
  ],
})
export class ReportsModule {}
