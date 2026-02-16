import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TableModule } from 'primeng/table';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ReportListComponent } from './report-list.component';
import { FilterModule } from 'src/app/filter/filter.module';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import {LucideAngularModule,
  ArrowDownToLine,
  Trash
} from 'lucide-angular';
const routes: Routes = [{ path: '', component: ReportListComponent }];

@NgModule({
  declarations: [ReportListComponent],
  imports: [
    CommonModule,
    FormsModule,
    [RouterModule.forChild(routes)],
    TableModule,
    BreadcrumbModule,
    ButtonModule,
    InputTextModule,
    PreloaderModule,
    FilterModule,
    LucideAngularModule.pick({ 
      ArrowDownToLine,
      Trash
    })
  ],
})
export class ReportListModule {}
