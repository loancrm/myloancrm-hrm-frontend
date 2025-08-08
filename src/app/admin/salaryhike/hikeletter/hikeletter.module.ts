import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { HikeletterComponent } from './hikeletter.component';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { CapitalizeFirstPipe } from 'src/app/pipes/capitalize.pipe';

const routes: Routes = [{ path: '', component: HikeletterComponent }];

@NgModule({
  declarations: [HikeletterComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    BreadcrumbModule,
    ButtonModule,
    PreloaderModule,
    CapitalizeFirstPipe,
  ],
})
export class HikeletterModule {}
