import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelievingletterComponent } from './relievingletter.component';
import { RouterModule, Routes } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CapitalizeFirstPipe } from 'src/app/pipes/capitalize.pipe';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { ButtonModule } from 'primeng/button';

const routes: Routes = [{ path: '', component: RelievingletterComponent }];


@NgModule({
  declarations: [
    RelievingletterComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    BreadcrumbModule,
    CapitalizeFirstPipe,
    PreloaderModule,
    ButtonModule,
  ]
})
export class RelievingletterModule { }
