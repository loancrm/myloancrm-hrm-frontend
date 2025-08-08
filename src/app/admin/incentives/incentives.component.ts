import { Component, OnInit } from '@angular/core';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { Location } from '@angular/common';
import { RoutingService } from 'src/app/services/routing-service';
import { ToastService } from 'src/app/services/toast.service';
import { EmployeesService } from '../employees/employees.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ConfirmationService } from 'primeng/api';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
@Component({
  selector: 'app-incentives',
  templateUrl: './incentives.component.html',
  styleUrls: ['./incentives.component.scss'],
})
export class IncentivesComponent implements OnInit {
  breadCrumbItems: any = [];
  loading: any;
  searchFilter: any = {};
  activeItem: any;
  selectedMonth: Date;
  displayMonth: Date;
  currentTableEvent: any;
  selectedIncentive: any = null;
  isDialogVisible = false;
  employeeNameToSearch: any;
  userDetails: any;
  totalIncentivesCount: any = 0;
  items: any[];
  apiLoading: any;
  incentives: any = [];
  version = projectConstantsLocal.VERSION_DESKTOP;
  moment: any;
  capabilities: any;
  currentYear: number;
  constructor(
    private location: Location,
    private confirmationService: ConfirmationService,
    private localStorageService: LocalStorageService,
    private employeesService: EmployeesService,
    private toastService: ToastService,
    private routingService: RoutingService,
    private dateTimeProcessor: DateTimeProcessorService
  ) {
    const usertype = localStorageService.getItemFromLocalStorage('userType');
    this.moment = this.dateTimeProcessor.getMoment();
    // this.selectedMonth = this.moment(new Date())
    //   .subtract(1, 'month')
    //   .format('YYYY-MM');
    // this.displayMonth = this.moment(new Date())
    //   .subtract(1, 'month')
    //   .format('MMMM YYYY');
    this.selectedMonth = this.moment(new Date()).format('YYYY-MM');
    this.displayMonth = this.moment(new Date()).format('MMMM YYYY');
    this.breadCrumbItems = [
      {
        icon: 'fa fa-house',
        label: '  Dashboard',
        routerLink: `/${usertype}/dashboard`,
        queryParams: { v: this.version },
      },
      { label: 'Incentives' },
    ];
  }

  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
    const userDetails =
      this.localStorageService.getItemFromLocalStorage('userDetails');
    if (userDetails) {
      this.userDetails = userDetails.user;
    }
    this.capabilities = this.employeesService.getUserRbac();
    console.log('capabilities', this.capabilities);
    this.setupActiveItemTabs();
    const storedMonth = this.localStorageService.getItemFromLocalStorage(
      'selectedIncentiveMonth'
    );
    if (storedMonth) {
      this.selectedMonth = storedMonth;
      this.displayMonth = this.moment(this.selectedMonth).format('MMMM YYYY');
    }
  }

  onActiveItemChange(event: any) {
    this.activeItem = event;
  }

  onDateChange(event: any) {
    this.selectedMonth = this.moment(event).format('YYYY-MM');
    this.displayMonth = this.moment(event).format('MMMM YYYY');
    this.localStorageService.setItemOnLocalStorage(
      'selectedIncentiveMonth',
      this.selectedMonth
    );
    this.loadIncentives(this.currentTableEvent);
  }
  setupActiveItemTabs() {
    this.items = [
      { label: 'First Month Files', name: 'firstMonthFiles' },
      { label: 'Second Month Files', name: 'secondMonthFiles' },
      { label: 'Third Month Files', name: 'thirdMonthFiles' },
    ];
    this.activeItem = this.items[0];
  }

  getFilesForActiveTab(): any[] {
    if (!this.selectedIncentive || !this.activeItem) return [];
    switch (this.activeItem.name) {
      case 'firstMonthFiles':
        return this.selectedIncentive.firstMonthFiles || [];
      case 'secondMonthFiles':
        return this.selectedIncentive.secondMonthFiles || [];
      case 'thirdMonthFiles':
        return this.selectedIncentive.thirdMonthFiles || [];
      default:
        return [];
    }
  }
  inputValueChangeEvent(dataType, value) {
    if (value == '') {
      this.searchFilter = {};
      console.log(this.currentTableEvent);
      this.loadIncentives(this.currentTableEvent);
    }
  }

  filterWithEmployeeName() {
    let searchFilter = { 'employeeName-like': this.employeeNameToSearch };
    this.applyFilters(searchFilter);
  }
  applyFilters(searchFilter = {}) {
    this.searchFilter = searchFilter;
    console.log(this.currentTableEvent);
    this.loadIncentives(this.currentTableEvent);
  }

  loadIncentives(event) {
    this.currentTableEvent = event;
    let api_filter = this.employeesService.setFiltersFromPrimeTable(event);
    api_filter = Object.assign({}, api_filter, this.searchFilter);
    if (this.capabilities.employeeIncentives) {
      api_filter['employeeId-eq'] = this.userDetails?.employeeId;
    } else {
      api_filter['incentiveApplicableMonth-eq'] = this.selectedMonth;
    }
    if (api_filter) {
      this.getIncentivesCount(api_filter);
      this.getIncentives(api_filter);
    }
  }

  getIncentivesCount(filter = {}) {
    this.employeesService.getIncentivesCount(filter).subscribe(
      (response) => {
        this.totalIncentivesCount = response;
      },
      (error: any) => {
        this.toastService.showError(error);
      }
    );
  }
  showUserDetails(user: any): void {
    this.selectedIncentive = user;
    this.isDialogVisible = true;
  }
  clearDialog(): void {
    this.selectedIncentive = null;
    this.isDialogVisible = false;
  }

  getIncentives(filter = {}) {
    this.apiLoading = true;
    this.employeesService.getIncentives(filter).subscribe(
      (incentiveresponse: any) => {
        this.employeesService.getEmployees().subscribe(
          (employeeResponse: any) => {
            this.incentives = this.mergeIncentivesWithEmployees(
              incentiveresponse,
              employeeResponse
            );
            console.log('Merged Incentives Data:', this.incentives);
            this.apiLoading = false;
          },
          (error: any) => {
            this.apiLoading = false;
            this.toastService.showError(error);
          }
        );
      },
      (error: any) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      }
    );
  }
  mergeIncentivesWithEmployees(incentive: any[], employees: any[]): any[] {
    return incentive.map((p) => {
      const employee = employees.find((e) => e.employeeId === p.employeeId);
      return employee ? { ...p, passPhoto: employee.passPhoto } : p;
    });
  }

  confirmDelete(incentive) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this Incentive ? <br>
              Employee Name: ${incentive.employeeName}<br>
              Incentive ID: ${incentive.incentiveId}
              `,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteIncentive(incentive.incentiveId);
      },
    });
  }

  deleteIncentive(incentiveId) {
    this.loading = true;
    this.employeesService.deleteIncentive(incentiveId).subscribe(
      (response: any) => {
        console.log(response);
        this.toastService.showSuccess(response?.message);
        this.loading = false;
        this.loadIncentives(this.currentTableEvent);
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  updateIncentive(incentiveId) {
    this.routingService.handleRoute('incentives/update/' + incentiveId, null);
  }
  addIncentive() {
    this.routingService.handleRoute('incentives/create', null);
  }

  goBack() {
    this.location.back();
  }
}
