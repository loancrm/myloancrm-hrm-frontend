import { Component,ViewChild } from '@angular/core';
import { EmployeesService } from '../../employees/employees.service';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { RoutingService } from 'src/app/services/routing-service';
import { ToastService } from 'src/app/services/toast.service';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss']
})
export class TemplateListComponent {
  templates: any[] = [];
  loading: any;
  totaltemplatesCount: any = 0;
  currentTableEvent: any;
  @ViewChild('templatesTable') templatesTable!: Table;
  constructor(
    private employeesService: EmployeesService,
    private router: Router,
    private routingService: RoutingService,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    this.employeesService.getAllTemplates().subscribe((res: any) => {
      this.templates = res;
    });
  }

  editTemplate(id: number) {
    // this.router.navigate(['customtemplate', id]);
    this.router.navigate(['/user/settings/customtemplate', id]);

  }

  // toggleStatus(row: any) {
  //   this.employeesService.updateTemplateStatus(row.id, row.status === 1 ? 0 : 1)
  //     .subscribe(() => row.status = row.status === 1 ? 0 : 1);
  // }
  toggleStatus(row: any) {
  const newStatus = row.status === 1 ? 0 : 1;

  this.employeesService
    .updateTemplateStatus(row.id, newStatus)
    .subscribe(() => {
      row.status = newStatus; // 🔥 THIS fixes button text
    });
}
showDefaultError() {
  this.toastService.showError({error:"Default template can't be modified"});
}

actionItems(row: any): MenuItem[] {

  // 🔒 DEFAULT TEMPLATE (accountId = 0)
  if (row.canEdit === 0) {
    return [
      {
        label: 'Actions',
        items: [
          {
            label: 'Edit',
            icon: 'fa fa-pen-to-square',
            disabled: true,
            command: () => {
              this.toastService.showError(
                "Default template can't be modified"
              );
            }
          },
          {
            label: row.status === 1 ? 'Inactive' : 'Active',
            icon: 'fa fa-power-off',
            disabled: true,
            command: () => {
              this.toastService.showError(
                "Default template can't be modified"
              );
            }
          }
        ]
      }
    ];
  }

  // ✅ CUSTOM TEMPLATE (accountId != 0)
  const items: MenuItem[] = [];

  if (row.canEdit === 1) {
    items.push({
      label: 'Edit',
      icon: 'fa fa-pen-to-square',
      disabled: row.status === 0,
      command: () => this.editTemplate(row.id)
    });
  }

   if (row.canEdit === 1) {
    items.push({
    label: row.status === 1 ? 'Inactive' : 'Active',
    icon: 'fa fa-power-off',
    command: () => this.toggleStatus(row)
  });
   }
  

  return [{ label: 'Actions', items }];
}

goToCustomTemplate() {
  this.routingService.handleRoute('settings/customtemplate', null);
}

getTemplateStatusStyle(status: number) {
  if (status === 1) {
    return {
      backgroundColor: '#E6F4EA',
      textColor: '#1E7E34',
      dotColor: '#1E7E34',
      width: '72px'
    };
  }

  return {
    backgroundColor: '#FDECEA',
    textColor: '#D93025',
    dotColor: '#D93025',
    width: '82px'
  };
}

getEmployeesCount(filter = {}) {
    this.employeesService.getTemplatesCount(filter).subscribe(
      (response) => {
        this.totaltemplatesCount = response;
        console.log('Total Templates Count:', this.totaltemplatesCount);
      },
      (error: any) => {
        this.toastService.showError(error);
      }
    );
  }

  loadEmployees(event: any) {
    this.currentTableEvent = event;
    let api_filter = this.employeesService.setFiltersFromPrimeTable(event);
    if (api_filter) {
      this.getEmployeesCount(api_filter);
      // this.getEmployees(api_filter);
    }
  }
}