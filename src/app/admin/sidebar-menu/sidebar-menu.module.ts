import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SidebarMenuComponent } from './sidebar-menu.component';
import { CapitalizeFirstPipe } from 'src/app/pipes/capitalize.pipe';

@NgModule({
  declarations: [SidebarMenuComponent],
  imports: [
    CommonModule,
    RouterModule,
    SidebarModule,
    TooltipModule,
    ButtonModule,
    LazyLoadImageModule,
    CapitalizeFirstPipe,
  ],
  exports: [SidebarMenuComponent],
})
export class SidebarMenuModule {}
