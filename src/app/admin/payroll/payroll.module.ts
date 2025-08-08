import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { PayrollComponent } from './payroll.component';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { FilterModule } from 'src/app/filter/filter.module';
import { CapitalizeFirstPipe } from 'src/app/pipes/capitalize.pipe';

const routes: Routes = [
  { path: '', component: PayrollComponent },
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
    path: 'payslip/:id',
    loadChildren: () =>
      import('./payslip/payslip.module').then((m) => m.PayslipModule),
  },
];
@NgModule({
  declarations: [PayrollComponent],
  imports: [
    CommonModule,
    FormsModule,
    [RouterModule.forChild(routes)],
    BreadcrumbModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    DialogModule,
    MenuModule,
    PreloaderModule,
    FilterModule,
    CapitalizeFirstPipe,
  ],
})
export class PayrollModule {}
