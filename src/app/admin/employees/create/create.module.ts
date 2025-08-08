import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { StepsModule } from 'primeng/steps';
import { CreateComponent } from './create.component';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { FileUploadModule } from '../../file-upload/file-upload.module';
const routes: Routes = [{ path: '', component: CreateComponent }];

@NgModule({
  declarations: [CreateComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    [RouterModule.forChild(routes)],
    BreadcrumbModule,
    InputTextareaModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    StepsModule,
    PreloaderModule,
    FileUploadModule,
  ],
})
export class CreateModule {}
