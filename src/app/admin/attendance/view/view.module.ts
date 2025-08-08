import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ViewComponent } from './view.component';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { CapitalizeFirstPipe } from 'src/app/pipes/capitalize.pipe';
import { InputTextareaModule } from 'primeng/inputtextarea';

const routes: Routes = [{ path: '', component: ViewComponent }];

@NgModule({
  declarations: [ViewComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    BreadcrumbModule,
    TableModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    PreloaderModule,
    CapitalizeFirstPipe,
  ],
})
export class ViewModule {}
