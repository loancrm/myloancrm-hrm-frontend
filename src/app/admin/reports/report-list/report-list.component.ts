import { Component } from '@angular/core';
import { EmployeesService } from '../../employees/employees.service';
import { ToastService } from 'src/app/services/toast.service';
import { Location } from '@angular/common';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ConfirmationService } from 'primeng/api';
@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss'],
})
export class ReportListComponent {
  breadCrumbItems: any = [];
  reportsData: any = [];
  loading: any;
  apiLoading: any;
  capabilities: any;
  appliedFilter: {};
  filterConfig: any[] = [];
  currentTableEvent: any;
  reportTypeToSearch: any;
  searchFilter: any = {};
  version = projectConstantsLocal.VERSION_DESKTOP;

  reportsCount: any = 0;
  currentYear: number;
  constructor(
    private location: Location,
    private confirmationService: ConfirmationService,
    private employeesService: EmployeesService,
    private toastService: ToastService,
    private localStorageService: LocalStorageService
  ) {
    this.breadCrumbItems = [
      {
        icon: 'fa fa-house',
        label: ' Dashboard',
        routerLink: '/user/dashboard',
        queryParams: { v: this.version },
      },
      {
        label: 'Reports',
        routerLink: '/user/reports',
        queryParams: { v: this.version },
      },
      { label: 'Saved Reports' },
    ];
  }

  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
    this.capabilities = this.employeesService.getUserRbac();
    console.log('capabilities', this.capabilities);
    this.setFilterConfig();
    const storedReportType =
      this.localStorageService.getItemFromLocalStorage('reportType');
    if (storedReportType) {
      this.reportTypeToSearch = storedReportType;
      this.filterWithReportType();
    }
    const storedAppliedFilter =
      this.localStorageService.getItemFromLocalStorage('reportsAppliedFilter');
    if (storedAppliedFilter) {
      this.appliedFilter = storedAppliedFilter;
    }
  }

  setFilterConfig() {
    this.filterConfig = [
      {
        header: 'Report Id',
        data: [
          {
            field: 'reportId',
            title: 'Report Id',
            type: 'text',
            filterType: 'like',
          },
        ],
      },

      {
        header: 'Report Type',
        data: [
          {
            field: 'reportType',
            title: 'Report Type',
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
        header: 'Created By',
        data: [
          {
            field: 'createdBy',
            title: 'Created By',
            type: 'text',
            filterType: 'like',
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
    ];
  }
  loadReports(event) {
    console.log(event);
    this.currentTableEvent = event;
    let api_filter = this.employeesService.setFiltersFromPrimeTable(event);
    api_filter = Object.assign(
      {},
      api_filter,
      this.searchFilter,
      this.appliedFilter
    );
    if (api_filter) {
      console.log(api_filter);
      this.getReportsCount(api_filter);
      this.getReports(api_filter);
    }
  }
  getReportsCount(filter = {}) {
    this.employeesService.getReportsCount(filter).subscribe(
      (response) => {
        this.reportsCount = response;
        console.log(this.reportsCount);
      },
      (error: any) => {
        this.toastService.showError(error);
      }
    );
  }
  getReports(filter = {}) {
    this.apiLoading = true;
    this.employeesService.getReports(filter).subscribe(
      (response) => {
        this.reportsData = response;
        console.log(this.reportsData);
        this.apiLoading = false;
      },
      (error: any) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      }
    );
  }

  filterWithReportType(): void {
    const reportTypeToSearch =
      this.localStorageService.getItemFromLocalStorage('reportType') ||
      this.reportTypeToSearch;
    if (reportTypeToSearch) {
      const searchFilter = { 'reportType-like': reportTypeToSearch };
      this.applyFilters(searchFilter);
    }
  }
  applyFilters(searchFilter = {}) {
    this.searchFilter = searchFilter;
    console.log(this.currentTableEvent);
    this.loadReports(this.currentTableEvent);
  }
  inputValueChangeEvent(dataType: string, value: string): void {
    if (value === '') {
      this.searchFilter = {};
      this.localStorageService.setItemOnLocalStorage('reportType', value);
      console.log(this.currentTableEvent);
      this.loadReports(this.currentTableEvent);
    } else {
      this.localStorageService.setItemOnLocalStorage('reportType', value);
    }
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
      'reportsAppliedFilter',
      this.appliedFilter
    );
    this.loadReports(this.currentTableEvent);
  }

  confirmDelete(report) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this Report ? <br>
      Report Type: ${report.reportType}<br>
      Report ID: ${report.reportId}
      `,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteReport(report.reportId);
      },
    });
  }

  deleteReport(reportId) {
    this.loading = true;
    this.employeesService.deleteReport(reportId).subscribe(
      (response: any) => {
        console.log(response);
        this.toastService.showSuccess(response?.message);
        this.loading = false;
        this.loadReports(this.currentTableEvent);
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }

  goBack() {
    this.location.back();
  }
}
