import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterComponent } from './filter.component';
import { SidebarModule } from 'primeng/sidebar';
import { AccordionModule } from "primeng/accordion";
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from "primeng/multiselect";
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
  declarations: [
    FilterComponent
  ],
  imports: [
    CommonModule,
    SidebarModule,
    AccordionModule,
    CalendarModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    FormsModule,

    MultiSelectModule
  ],
  exports:[
    FilterComponent
  ]
})
export class FilterModule { }
