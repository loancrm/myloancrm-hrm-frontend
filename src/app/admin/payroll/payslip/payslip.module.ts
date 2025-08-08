import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { PayslipComponent } from './payslip.component';
import {
  CapitalizeFirstPipe,
  RoundOffPipe,
} from 'src/app/pipes/capitalize.pipe';
import { PreloaderModule } from 'src/app/preloader/preloader.module';

const routes: Routes = [{ path: '', component: PayslipComponent }];

@NgModule({
  declarations: [PayslipComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    BreadcrumbModule,
    ButtonModule,
    RoundOffPipe,
    CapitalizeFirstPipe,
    PreloaderModule,
  ],
})
export class PayslipModule {}
