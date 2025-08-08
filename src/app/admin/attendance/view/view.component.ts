import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { EmployeesService } from '../../employees/employees.service';
import { ToastService } from 'src/app/services/toast.service';
import { ActivatedRoute } from '@angular/router';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {
  breadCrumbItems: any = [];
  currentTableEvent: any;
  countsAnalytics: any[] = [];
  loading: boolean = false;
  apiLoading: any;
  moment: any;
  employees: any[] = [];
  attendanceData: any;
  attendanceId: any;
  selectedDate: Date;
  employeeDetails: any[] = [];
  totalEmployeesCount: number = 0;
  totalPresentCount: number = 0;
  totalAbsentCount: number = 0;
  totalHalfDayCount: number = 0;
  totalLateCount: number = 0;
  employeeNameToSearch: any;
  searchFilter: any = {};
  currentYear: number;
  version = projectConstantsLocal.VERSION_DESKTOP;
  constructor(
    private location: Location,
    private employeesService: EmployeesService,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private dateTimeProcessor: DateTimeProcessorService
  ) {
    this.moment = this.dateTimeProcessor.getMoment();
    this.activatedRoute.params.subscribe((params) => {
      if (params && params['id']) {
        this.attendanceId = params['id'];
        this.fetchAttendanceData();
      }
    });
    this.breadCrumbItems = [
      {
        icon: 'fa fa-house',
        label: ' Dashboard',
        routerLink: '/user/dashboard',
        queryParams: { v: this.version },
      },
      {
        label: 'Attendance',
        routerLink: '/user/attendance',
        queryParams: { v: this.version },
      },
      { label: 'View Attendance' },
    ];
  }
  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
    this.updateCountsAnalytics();
  }
  async fetchAttendanceData() {
    try {
      this.loading = true;
      const dataFetched = await this.getAttendanceById();
      if (dataFetched) {
        this.selectedDate = this.moment(
          this.attendanceData?.attendanceDate
        ).format('MM/DD/YYYY');
        console.log('Attendance Data:', this.attendanceData);
        this.calculateAttendanceCounts();
        this.setDefaultAttendanceData();
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      this.loading = false;
    }
  }
  updateCountsAnalytics() {
    this.countsAnalytics = [
      {
        name: 'circle-user',
        displayName: 'Employees',
        count:
          this.totalPresentCount +
          this.totalAbsentCount +
          this.totalHalfDayCount +
          this.totalLateCount,
        textcolor: '#6C5FFC',
        backgroundcolor: '#F0EFFF',
      },
      {
        name: 'check-circle',
        displayName: 'Present',
        count: this.totalPresentCount,
        textcolor: '#2ECC71',
        backgroundcolor: '#F0F9E8',
      },
      {
        name: 'circle-exclamation',
        displayName: 'Late',
        count: this.totalLateCount,
        textcolor: '#0D6EFD',
        backgroundcolor: '#E0F3FF',
      },
      {
        name: 'circle-half-stroke',
        displayName: 'Half Day',
        count: this.totalHalfDayCount,
        textcolor: '#FFC107',
        backgroundcolor: '#FFF3D6',
      },
      {
        name: 'circle-xmark',
        displayName: 'On Leave',
        count: this.totalAbsentCount,
        textcolor: '#DC3545',
        backgroundcolor: '#F8D7DA',
      },
    ];
  }
  calculateAttendanceCounts() {
    this.totalPresentCount =
      this.totalAbsentCount =
      this.totalHalfDayCount =
      this.totalLateCount =
        0;
    this.attendanceData?.attendanceData.forEach((attendance) => {
      switch (attendance.status) {
        case 'Present':
          this.totalPresentCount++;
          break;
        case 'Absent':
          this.totalAbsentCount++;
          break;
        case 'Late':
          this.totalLateCount++;
          break;
        case 'Half-day':
          this.totalHalfDayCount++;
          break;
      }
    });
    console.log(
      `Present: ${this.totalPresentCount}, Absent: ${this.totalAbsentCount}, Half-day: ${this.totalHalfDayCount}, Late: ${this.totalLateCount}`
    );
    this.updateCountsAnalytics();
  }
  loadEmployees(event) {
    this.currentTableEvent = event;
    console.log(event.first);
    let api_filter = this.employeesService.setFiltersFromPrimeTable(event);
    api_filter = Object.assign({}, api_filter, this.searchFilter);
    if ('from' in api_filter) {
      delete api_filter.from;
    }
    console.log(api_filter);
    if (api_filter) {
      this.getEmployeesCount(api_filter);
      this.getEmployees(api_filter);
    }
  }
  getEmployeesCount(filter = {}) {
    this.employeesService.getEmployeesCount(filter).subscribe(
      (response: any) => {
        this.totalEmployeesCount = response;
        this.updateCountsAnalytics();
      },
      (error: any) => {
        this.toastService.showError(error);
      }
    );
  }
  setDefaultAttendanceData() {
    this.employeeDetails = this.employees
      .filter((employee) =>
        this.attendanceData?.attendanceData.some(
          (att) => att.employeeId === employee.employeeId
        )
      )
      .map((employee) => {
        const attendance = this.attendanceData?.attendanceData.find(
          (att) => att.employeeId === employee.employeeId
        );
        return {
          ...employee,
          status: attendance?.status,
          checkInTime: attendance?.checkInTime,
          checkOutTime: attendance?.checkOutTime,
          reason: attendance?.reason,
        };
      });
    console.log(
      'Employee Details with Attendance Data for View:',
      this.employeeDetails
    );
  }
  getEmployees(filter = {}) {
    this.apiLoading = true;
    this.employeesService.getEmployees(filter).subscribe(
      (response: any) => {
        this.employees = response;
        console.log('employees', this.employees);
        this.apiLoading = false;
        this.setDefaultAttendanceData();
      },
      (error: any) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      }
    );
  }
  getAttendanceById(filter = {}) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.employeesService
        .getAttendanceById(this.attendanceId, filter)
        .subscribe(
          (response) => {
            this.attendanceData = response;
            this.loading = false;
            resolve(true);
          },
          (error: any) => {
            this.loading = false;
            resolve(false);
            this.toastService.showError(error);
          }
        );
    });
  }
  inputValueChangeEvent(dataType, value) {
    if (value == '') {
      this.searchFilter = {};
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
  goBack() {
    this.location.back();
  }
}
