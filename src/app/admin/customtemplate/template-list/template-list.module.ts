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
@NgModule({
  declarations: [
    TemplateListComponent   // ✅ DECLARED
  ],
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    RouterModule,
    MenuModule  // ✅ IMPORTED
  ],
  exports: [
    TemplateListComponent   // ✅ EXPORTED (THIS WAS MISSING)
  ]
})
export class TemplateListModule {}
