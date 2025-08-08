import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { HeaderModule } from './header/header.module';
import { SidebarMenuModule } from './sidebar-menu/sidebar-menu.module';

@NgModule({
  declarations: [AdminComponent],
  imports: [
    CommonModule,
    HeaderModule,
    AdminRoutingModule,
    HttpClientModule,
    SidebarMenuModule
  ],
})
export class AdminModule {}
