// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { TableModule } from 'primeng/table';



// @NgModule({
//   declarations: [],
//   imports: [
//     CommonModule,
//     TableModule
//   ]
// })
// export class TemplateListModule { }


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { TemplateListComponent } from './template-list.component';
import { MenuModule } from 'primeng/menu'; 
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import {LucideAngularModule,
  MoreVertical,
  ShieldBan,
  ShieldCheck,
}from 'lucide-angular';
@NgModule({
  declarations: [
    TemplateListComponent   // ✅ DECLARED
  ],
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    RouterModule,
    MenuModule,
    MatMenuModule,
    MatButtonModule,
    LucideAngularModule.pick({
      ShieldBan,
      ShieldCheck,
      MoreVertical,
    })

  ],
  exports: [
    TemplateListComponent   // ✅ EXPORTED (THIS WAS MISSING)
  ]
})
export class TemplateListModule {}
