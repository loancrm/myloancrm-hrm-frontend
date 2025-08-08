import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { RoutingService } from 'src/app/services/routing-service';
import { EmployeesService } from './employees.service';
import { ToastService } from 'src/app/services/toast.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
})
export class EmployeesComponent implements OnInit {
  breadCrumbItems: any = [];
  currentTableEvent: any;
  filterConfig: any[] = [];
  totalEmployeesCount: any = 0;
  loading: any;
  appliedFilter: {};
  searchFilter: any = {};
  employeeStatusCount = {
    statusCount: { 1: 0, 2: 0 },
    newEmployeeCount: { new: 0, old: 0 },
  };
  employeeNameToSearch: any;
  countsAnalytics: any[] = [];
  @ViewChild('employeesTable') employeesTable!: Table;
  employees: any = [];
  version = projectConstantsLocal.VERSION_DESKTOP;
  designationDetails: any;
  branchDetails: any = projectConstantsLocal.BRANCH_ENTITIES;
  genderDetails: any = projectConstantsLocal.GENDER_ENTITIES;
  qualificationDetails: any = projectConstantsLocal.QUALIFICATION_ENTITIES;
  employeeInternalStatusList: any = projectConstantsLocal.EMPLOYEE_STATUS;
  selectedEmployeeStatus = this.employeeInternalStatusList[1];
  apiLoading: any;
  capabilities: any;
  currentYear: number;
  constructor(
    private employeesService: EmployeesService,
    private location: Location,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private routingService: RoutingService,
    private localStorageService: LocalStorageService
  ) {
    this.breadCrumbItems = [
      {
        icon: 'fa fa-house',
        label: '  Dashboard',
        routerLink: '/user/dashboard',
        queryParams: { v: this.version },
      },
      { label: 'Employees' },
    ];
    this.getDesignations();
  }
  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
    this.capabilities = this.employeesService.getUserRbac();
    console.log('capabilities', this.capabilities);
    this.updateCountsAnalytics();
    // this.setFilterConfig();
    this.getEmployeesStatusCount();
    const storedStatus = this.localStorageService.getItemFromLocalStorage(
      'selectedEmployeeStatus'
    );
    if (storedStatus) {
      this.selectedEmployeeStatus = storedStatus;
    }
    const storedAppliedFilter =
      this.localStorageService.getItemFromLocalStorage(
        'employeesAppliedFilter'
      );
    if (storedAppliedFilter) {
      this.appliedFilter = storedAppliedFilter;
    }
  }
  updateCountsAnalytics() {
    this.countsAnalytics = [
      {
        name: 'user-group',
        displayName: 'All Employees',
        count:
          this.employeeStatusCount.statusCount['1'] +
          this.employeeStatusCount.statusCount['2'],
        textcolor: '#6C5FFC',
        backgroundcolor: '#F0EFFF',
      },
      {
        name: 'circle-user',
        displayName: 'New Employees',
        count: this.employeeStatusCount.newEmployeeCount['new'],
        textcolor: '#2980B9',
        backgroundcolor: '#D5E8F7',
      },
      {
        name: 'check-circle',
        displayName: 'Active Employees',
        count: this.employeeStatusCount.statusCount['1'],
        textcolor: '#2ECC71',
        backgroundcolor: '#F0F9E8',
      },
      {
        name: 'circle-xmark',
        displayName: 'InActive Employees',
        count: this.employeeStatusCount.statusCount['2'],
        textcolor: '#DC3545',
        backgroundcolor: '#F8D7DA',
      },
    ];
  }
  actionItems(employee: any): MenuItem[] {
    const menuItems: any = [{ label: 'Actions', items: [] }];
    if (employee.employeeInternalStatus === 1) {
      menuItems[0].items.push({
        label: 'Profile',
        icon: 'fa fa-eye',
        command: () => this.employeeProfile(employee.employeeId),
      });
      menuItems[0].items.push({
        label: 'Offer Letter',
        icon: 'fa fa-file',
        command: () => this.ViewOfferletter(employee.employeeId),
      });
      menuItems[0].items.push({
        label: 'Update',
        icon: 'fa fa-pen-to-square',
        command: () => this.updateEmployee(employee.employeeId),
      });
      menuItems[0].items.push({
        label: 'InActive',
        icon: 'fa fa-right-to-bracket',
        command: () => this.inactiveEmployee(employee),
      });
      if (this.capabilities.delete) {
        menuItems[0].items.push({
          label: 'Delete',
          icon: 'fa fa-trash',
          command: () => this.confirmDelete(employee),
        });
      }
    } else if (employee.employeeInternalStatus === 2) {
      menuItems[0].items.push({
        label: 'Profile',
        icon: 'fa fa-eye',
        command: () => this.employeeProfile(employee.employeeId),
      });
      menuItems[0].items.push({
        label: 'Relieving Letter',
        icon: 'fa fa-file',
        command: () => this.ViewRelievingletter(employee.employeeId),
      });
      menuItems[0].items.push({
        label: 'Active',
        icon: 'fa fa-right-to-bracket',
        command: () => this.activateEmployee(employee),
      });
    }
    return menuItems;
  }
  setFilterConfig() {
    this.filterConfig = [
      {
        header: 'Employee Id',
        data: [
          {
            field: 'employeeId',
            title: 'Employee Id',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Custom Employee Id',
        data: [
          {
            field: 'customEmployeeId',
            title: 'Custom Employee Id',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Employee Name',
        data: [
          {
            field: 'employeeName',
            title: 'Employee Name',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Created Date Range',
        data: [
          {
            field: 'createdOn',
            title: 'From',
            type: 'date',
            filterType: 'gte',
          },
          { field: 'createdOn', title: 'To', type: 'date', filterType: 'lte' },
        ],
      },
      {
        header: 'Phone Number',
        data: [
          {
            field: 'primaryPhone',
            title: 'Phone Number',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Secondary Number',
        data: [
          {
            field: 'secondaryPhone',
            title: 'Secondary Number',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Designation',
        data: [
          {
            field: 'designation',
            title: 'Designation',
            type: 'dropdown',
            filterType: 'like',
            options: this.designationDetails.map((entity) => ({
              label: entity.displayName,
              value: entity.id,
            })),
          },
        ],
      },
      {
        header: 'Joining Date',
        data: [
          {
            field: 'joiningDate',
            title: 'Joining Date',
            type: 'date',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Joining Date Range',
        data: [
          {
            field: 'joiningDate',
            title: 'From',
            type: 'date',
            filterType: 'gte',
          },
          {
            field: 'joiningDate',
            title: 'To',
            type: 'date',
            filterType: 'lte',
          },
        ],
      },
      {
        header: 'Office Branch',
        data: [
          {
            field: 'ofcBranch',
            title: 'Branch',
            type: 'dropdown',
            filterType: 'like',
            options: this.branchDetails.map((entity) => ({
              label: entity.displayName,
              value: entity.id,
            })),
          },
        ],
      },
      {
        header: 'Salary',
        data: [
          {
            field: 'salary',
            title: 'Salary',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Email',
        data: [
          {
            field: 'emailAddress',
            title: 'Email',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Date Of Birth',
        data: [
          {
            field: 'dateOfBirth',
            title: 'Date Of Birth',
            type: 'date',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'City',
        data: [
          {
            field: 'city',
            title: 'City',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'District',
        data: [
          {
            field: 'district',
            title: 'District',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'State',
        data: [
          {
            field: 'state',
            title: 'State',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Gender',
        data: [
          {
            field: 'gender',
            title: 'Gender',
            type: 'dropdown',
            filterType: 'like',
            options: this.genderDetails.map((entity) => ({
              label: entity.displayName,
              value: entity.id,
            })),
          },
        ],
      },
      {
        header: 'created On  ',
        data: [
          {
            field: 'createdOn',
            title: 'Date ',
            type: 'date',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Qualification',
        data: [
          {
            field: 'qualification',
            title: 'Qualification',
            type: 'dropdown',
            filterType: 'like',
            options: this.qualificationDetails.map((entity) => ({
              label: entity.displayName,
              value: entity.name,
            })),
          },
        ],
      },
      {
        header: 'Experience',
        data: [
          {
            field: 'experience',
            title: 'Experience',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Pan Number',
        data: [
          {
            field: 'panNumber',
            title: 'Pan Number',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Aadhaar Number',
        data: [
          {
            field: 'aadharNumber',
            title: 'Aadhaar Number',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Account Holder Name',
        data: [
          {
            field: 'accountHolderName',
            title: 'Account Holder Name',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Bank Name',
        data: [
          {
            field: 'bankName',
            title: 'Bank Name',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Bank Branch',
        data: [
          {
            field: 'bankBranch',
            title: 'Bank Branch',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'IFSC Code',
        data: [
          {
            field: 'ifscCode',
            title: 'IFSC Code',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Account Number',
        data: [
          {
            field: 'accountNumber',
            title: 'Account Number',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Current Address',
        data: [
          {
            field: 'currentAddress',
            title: 'Current Address',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Permanent Address',
        data: [
          {
            field: 'permanentAddress',
            title: 'Permanent Address',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
    ];
  }

  applyConfigFilters(event) {
    let api_filter = event;
    if (api_filter['reset']) {
      delete api_filter['reset'];
      this.appliedFilter = {};
    } else {
      this.appliedFilter = api_filter;
    }
    this.localStorageService.setItemOnLocalStorage(
      'employeesAppliedFilter',
      this.appliedFilter
    );
    this.loadEmployees(this.currentTableEvent);
  }
  inactiveEmployee(employee) {
    this.changeEmployeeStatus(employee.employeeId, 2);
  }
  activateEmployee(employee) {
    this.changeEmployeeStatus(employee.employeeId, 1);
  }
  changeEmployeeStatus(employeeId, statusId) {
    this.loading = true;
    this.employeesService.changeEmployeeStatus(employeeId, statusId).subscribe(
      (response) => {
        this.toastService.showSuccess('Employee Status Changed Successfully');
        this.loading = false;
        this.loadEmployees(this.currentTableEvent);
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  confirmDelete(employee) {
    this.confirmationService.confirm({
      // message: 'Are you sure you want to delete this Employee?',
      message: `Are you sure you want to delete this Employee ?<br>
              Employee Name: ${employee.employeeName}<br>
              Employee ID: ${employee.employeeId}
              `,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.deleteEmployee(employee.employeeId);
      },
    });
  }
  deleteEmployee(employeeId) {
    this.loading = true;
    this.employeesService.deleteEmployee(employeeId).subscribe(
      (response: any) => {
        console.log(response);
        this.toastService.showSuccess(response?.message);
        this.loading = false;
        this.loadEmployees(this.currentTableEvent);
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }

  statusChange(event: any): void {
    this.localStorageService.setItemOnLocalStorage(
      'selectedEmployeeStatus',
      event.value
    );
    this.loadEmployees(this.currentTableEvent);
  }
  inputValueChangeEvent(dataType, value) {
    if (value == '') {
      this.searchFilter = {};
      // localStorage.setItem('employeeNameToSearch', value);
      console.log(this.currentTableEvent);
      this.loadEmployees(this.currentTableEvent);
    }
  }
  filterWithEmployeeName() {
    let searchFilter = { 'employeeName-like': this.employeeNameToSearch };
    this.applyFilters(searchFilter);
  }
  applyFilters(searchFilter = {}) {
    this.searchFilter = searchFilter;
    console.log(this.currentTableEvent);
    this.loadEmployees(this.currentTableEvent);
  }
  loadEmployees(event) {
    this.currentTableEvent = event;
    let api_filter = this.employeesService.setFiltersFromPrimeTable(event);
    if (this.selectedEmployeeStatus) {
      if (this.selectedEmployeeStatus && this.selectedEmployeeStatus.name) {
        if (this.selectedEmployeeStatus.name != 'all') {
          api_filter['employeeInternalStatus-eq'] =
            this.selectedEmployeeStatus.id;
        } else {
          api_filter['employeeInternalStatus-or'] = '1,2';
        }
      }
    }
    console.log(api_filter);
    api_filter = Object.assign(
      {},
      api_filter,
      this.searchFilter,
      this.appliedFilter
    );
    console.log(api_filter);
    if (api_filter) {
      this.getEmployeesCount(api_filter);
      this.getEmployees(api_filter);
    }
  }
  getEmployeesCount(filter = {}) {
    this.employeesService.getEmployeesCount(filter).subscribe(
      (response) => {
        this.totalEmployeesCount = response;
      },
      (error: any) => {
        this.toastService.showError(error);
      }
    );
  }
  countEmployeeInternalStatus(employees: any[]) {
    const statusCount = { 1: 0, 2: 0 };
    const newEmployeeCount = { new: 0, old: 0 };
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2);
    employees.forEach((employee) => {
      if (employee.employeeInternalStatus in statusCount) {
        statusCount[employee.employeeInternalStatus]++;
      }
      if (employee.employeeInternalStatus !== 2) {
        const joiningDate = new Date(employee.joiningDate);
        if (joiningDate > threeMonthsAgo) {
          newEmployeeCount.new++;
        } else {
          newEmployeeCount.old++;
        }
      }
    });
    return { statusCount, newEmployeeCount };
  }
  getEmployees(filter = {}) {
    this.apiLoading = true;
    this.employeesService.getEmployees(filter).subscribe(
      (response) => {
        this.employees = response;
        console.log('employees', this.employees);
        this.apiLoading = false;
      },
      (error: any) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      }
    );
  }
  getEmployeesStatusCount() {
    this.employeesService.getEmployees().subscribe(
      (response: any) => {
        this.employeeStatusCount = this.countEmployeeInternalStatus(response);
        console.log(this.employeeStatusCount);
        this.updateCountsAnalytics();
      },
      (error: any) => {
        this.toastService.showError(error);
      }
    );
  }
  getStatusName(statusId) {
    if (
      this.employeeInternalStatusList &&
      this.employeeInternalStatusList.length > 0
    ) {
      let employeeStatusName = this.employeeInternalStatusList.filter(
        (employeeStatus) => employeeStatus.id == statusId
      );
      return (
        (employeeStatusName &&
          employeeStatusName[0] &&
          employeeStatusName[0].name) ||
        ''
      );
    }
    return '';
  }

  getDesignations(filter = {}) {
    this.loading = true;
    filter['designationInternalStatus-eq'] = 1;
    this.employeesService.getDesignations(filter).subscribe(
      (response: any) => {
        console.log(response);
        this.designationDetails = [...response];
        this.loading = false;
        this.setFilterConfig();
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  getStatusColor(status: string): {
    textColor: string;
    backgroundColor: string;
  } {
    switch (status) {
      case 'Active':
        return { textColor: '#5DCC0B', backgroundColor: '#E4F7D6' };
      case 'InActive':
        return { textColor: '#FF555A', backgroundColor: '#FFE2E3' };
      default:
        return { textColor: 'black', backgroundColor: 'white' };
    }
  }
  createEmployee() {
    this.routingService.handleRoute('employees/create', null);
  }
  updateEmployee(employeeId) {
    this.routingService.handleRoute('employees/update/' + employeeId, null);
  }
  employeeProfile(employeeId) {
    this.routingService.handleRoute('employees/profile/' + employeeId, null);
  }
  ViewOfferletter(employeeId) {
    this.routingService.handleRoute(
      'employees/offerletter/' + employeeId,
      null
    );
  }
  ViewRelievingletter(employeeId) {
    this.routingService.handleRoute(
      'employees/relievingletter/' + employeeId,
      null
    );
  }
  goBack() {
    this.location.back();
  }
}
