import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InterviewsComponent } from './interviews.component';
import { CapitalizeFirstPipe } from 'src/app/pipes/capitalize.pipe';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { FilterModule } from 'src/app/filter/filter.module';

const routes: Routes = [
  { path: '', component: InterviewsComponent },
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
];

@NgModule({
  declarations: [InterviewsComponent],
  imports: [
    CommonModule,
    FormsModule,
    [RouterModule.forChild(routes)],
    BreadcrumbModule,
    TableModule,
    MenuModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    DialogModule,
    CapitalizeFirstPipe,
    PreloaderModule,
    FilterModule,
  ],
})
export class InterviewsModule {}
