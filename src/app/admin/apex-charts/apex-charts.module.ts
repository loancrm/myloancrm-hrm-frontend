import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApexChartsComponent } from './apex-charts.component';
import { NgApexchartsModule } from 'ng-apexcharts';

@NgModule({
  declarations: [ApexChartsComponent],
  imports: [CommonModule, NgApexchartsModule],
  exports: [ApexChartsComponent],
})
export class ApexChartsModule {}
