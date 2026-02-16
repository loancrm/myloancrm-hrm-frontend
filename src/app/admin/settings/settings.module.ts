import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { SettingsComponent } from './settings.component';
import { PreloaderModule } from 'src/app/preloader/preloader.module';
import { SettingsGuard } from './settings.guard';
import { CustomtemplateComponent } from '../customtemplate/customtemplate.component';
import { CustomtemplateModule } from '../customtemplate/customtemplate.module';
import { TemplateListModule } from '../customtemplate/template-list/template-list.module';
import { DropdownModule } from 'primeng/dropdown';
import {LucideAngularModule,
  SquarePen,
  Trash,
  Landmark,
} from 'lucide-angular';

// const routes: Routes = [
//   {
//     path: '',
//     component: SettingsComponent,
//     canActivate: [SettingsGuard],
//     children: [
//       {
//         path: 'customtemplate',
//         loadChildren: () =>
//           import('../customtemplate/customtemplate.module')
//             .then(m => m.CustomtemplateModule)
//       }
//     ]
//   }
// ];
const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    canActivate: [SettingsGuard],
  },
  {
    path: 'customtemplate',
    loadChildren: () =>
      import('../customtemplate/customtemplate.module')
        .then(m => m.CustomtemplateModule)
  }
];

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    [RouterModule.forChild(routes)],
    BreadcrumbModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DialogModule,
    TooltipModule,
    PreloaderModule,
    TemplateListModule,
    DropdownModule,
    LucideAngularModule.pick({ 
          SquarePen,
          Trash,
          Landmark,
         })
  ],
})
export class SettingsModule {}

