import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { OfferletterComponent } from './offerletter.component';
import { CapitalizeFirstPipe } from 'src/app/pipes/capitalize.pipe';
import { PreloaderModule } from 'src/app/preloader/preloader.module';

const routes: Routes = [{ path: '', component: OfferletterComponent }];

@NgModule({
  declarations: [OfferletterComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    BreadcrumbModule,
    ButtonModule,
    CapitalizeFirstPipe,
    PreloaderModule,
  ],
})
export class OfferletterModule {}
