import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { SalaryhikeComponent } from './salaryhike.component';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { CapitalizeFirstPipe } from 'src/app/pipes/capitalize.pipe';
import { FilterModule } from 'src/app/filter/filter.module';
import { MenuModule } from 'primeng/menu';

const routes: Routes = [
  { path: '', component: SalaryhikeComponent },
  {
    path: 'hikeletter/:id',
    loadChildren: () =>
      import('./hikeletter/hikeletter.module').then((m) => m.HikeletterModule),
  },
];

@NgModule({
  declarations: [SalaryhikeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    [RouterModule.forChild(routes)],
    InputTextModule,
    BreadcrumbModule,
    DialogModule,
    TableModule,
    DropdownModule,
    ButtonModule,
    CalendarModule,
    PreloaderModule,
    CapitalizeFirstPipe,
    FilterModule,
    MenuModule
  ],
})
export class SalaryhikeModule {}
