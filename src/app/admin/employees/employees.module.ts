import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { EmployeesComponent } from './employees.component';
import { CapitalizeFirstPipe } from 'src/app/pipes/capitalize.pipe';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { FilterModule } from 'src/app/filter/filter.module';

const routes: Routes = [
  { path: '', component: EmployeesComponent },
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
    path: 'profile/:id',
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfileModule),
  },
  {
    path: 'offerletter/:id',
    loadChildren: () =>
      import('./offerletter/offerletter.module').then(
        (m) => m.OfferletterModule
      ),
  },
  {
    path: 'relievingletter/:id',
    loadChildren: () =>
      import('./relievingletter/relievingletter.module').then(
        (m) => m.RelievingletterModule
      ),
  },
];

@NgModule({
  declarations: [EmployeesComponent],
  imports: [
    CommonModule,
    FormsModule,
    [RouterModule.forChild(routes)],
    BreadcrumbModule,
    ButtonModule,
    TableModule,
    MenuModule,
    DropdownModule,
    InputTextModule,
    SkeletonModule,
    CapitalizeFirstPipe,
    PreloaderModule,
    FilterModule,
  ],
})
export class EmployeesModule {}
