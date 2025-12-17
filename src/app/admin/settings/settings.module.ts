import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { SettingsComponent } from './settings.component';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { SettingsGuard } from './settings.guard';

const routes: Routes = [
  { 
    path: '', 
    component: SettingsComponent,
    canActivate: [SettingsGuard]
  }
];

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    [RouterModule.forChild(routes)],
    BreadcrumbModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DialogModule,
    TooltipModule,
    PreloaderModule,
  ],
})
export class SettingsModule {}

