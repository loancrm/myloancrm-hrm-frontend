import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomtemplateComponent } from './customtemplate.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
// const routes: Routes = [{ path: '', component: CustomtemplateComponent }];
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
// import { TemplateListComponent } from './template-list/template-list.component';
// import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

const routes: Routes = [
  { path: '', component: CustomtemplateComponent },
  { path: ':id', component: CustomtemplateComponent }
];
@NgModule({
  declarations: [
    CustomtemplateComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
     CKEditorModule,
     FormsModule,
     DropdownModule,
     ButtonModule,
     TableModule,
  ]
})
export class CustomtemplateModule { }
