import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreloaderComponent } from './preloader.component';

@NgModule({
  declarations: [PreloaderComponent],
  imports: [CommonModule],
  exports: [PreloaderComponent],
})
export class PreloaderModule {}
