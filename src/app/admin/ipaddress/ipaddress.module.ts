import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IpaddressComponent } from './ipaddress.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { InputTextModule } from 'primeng/inputtext';
import { FilterModule } from 'src/app/filter/filter.module';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { CapitalizeFirstPipe } from 'src/app/pipes/capitalize.pipe';

const routes: Routes = [{ path: '', component: IpaddressComponent }];

@NgModule({
  declarations: [IpaddressComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    [RouterModule.forChild(routes)],
    BreadcrumbModule,
    TableModule,
    ButtonModule,
    DialogModule,
    MenuModule,
    InputTextModule,
    FilterModule,
    PreloaderModule,
    CapitalizeFirstPipe,
  ],
})
export class IpaddressModule {}
