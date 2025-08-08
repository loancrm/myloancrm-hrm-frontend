import { Component } from '@angular/core';
import { EmployeesService } from '../../employees/employees.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { RoutingService } from 'src/app/services/routing-service';
import { ToastService } from 'src/app/services/toast.service';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
import { projectConstantsLocal } from 'src/app/constants/project-constants';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent {
  reportsListConfig: any = [];
  leadUsers: any = [];
  banks: any = [];
  breadCrumbItems: any = [];
  customerLabel: any;
  donationStatus: any;
  apptStatus: any;
  checkinStatus: any;
  crmStatus: any;
  cdlStatus: any;
  leadStatus: any;
  ivrStatus: any;
  orderStatus: any;
  memberStatus: any;
  showToken: any;
  activeUser: any;
  loading: any;
  reportType: any;
  selectedReportConfig: any;
  reportData: any = {};
  showDateRange: any = false;
  dateRangeFrom: any;
  dateRangeTo: any;
  moment: any;

  employeeStatusList = projectConstantsLocal.EMPLOYEE_STATUS;
  leaveStatusList = projectConstantsLocal.LEAVE_STATUS;
  interviewStatusList = projectConstantsLocal.INTERVIEW_STATUS;
  departementStatusList = projectConstantsLocal.DEPARTMENT_STATUS;
  designationStatusList = projectConstantsLocal.DESIGNATION_ENTITIES;
  officebranchEntities = projectConstantsLocal.BRANCH_ENTITIES;
  leaveTypeEntities = projectConstantsLocal.LEAVE_TYPE_ENTITIES;
  designationEntities: any[] = [];

  durationTypeEntities = projectConstantsLocal.DURATION_TYPE_ENTITIES;
  attendedInterviewStatus = projectConstantsLocal.ATTENDED_INTERVIEW_ENTITIES;
  years: { label: string; value: number }[] = [];
  dateRange = [
    { field: 'date', title: 'Date From', type: 'date', filterType: 'ge' },
    { field: 'date', title: 'Date To', type: 'date', filterType: 'le' },
  ];
  labels: any;
  locations: any = [];
  responseType: any = 'INLINE';
  isQuestionaire: any = false;
  financeStatus: any;
  invoiceCategories: any;
  version = projectConstantsLocal.VERSION_DESKTOP;
  currentYear: number;
  constructor(
    private location: Location,
    private employeesService: EmployeesService,
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService,
    private toastService: ToastService,
    private dateTimeProcessor: DateTimeProcessorService
  ) {
    this.breadCrumbItems = [
      {
        icon: 'pi pi-home',
        label: ' Dashboard',
        routerLink: '/user/dashboard',
        queryParams: { v: this.version },
      },
      {
        label: 'Reports',
        routerLink: '/user/reports',
        queryParams: { v: this.version },
      },
      { label: 'Generate Report' },
    ];

    this.moment = this.dateTimeProcessor.getMoment();
    this.activatedRoute.queryParams.subscribe((queryParams: any) => {
      if (queryParams && queryParams['reportType']) {
        this.reportType = queryParams['reportType'];
      } else {
        this.toastService.showError({ error: 'Invalid Url' });
        this.routingService.handleRoute('list', null);
      }
    });
  }
  ngOnInit() {
    this.currentYear = this.employeesService.getCurrentYear();
    this.getDesignations();
    this.generateYears();
  }
  updateBreadcrumb(): void {
    this.breadCrumbItems = [
      {
        icon: 'fa fa-house',
        label: '  Dashboard',
        routerLink: '/user/dashboard',
        queryParams: { v: this.version },
      },
      {
        label: 'Reports',
        routerLink: '/user/reports',
        queryParams: { v: this.version },
      },
      {
        label:
          this.selectedReportConfig?.reportName + ' Report' ||
          'Generate Report',
      },
    ];
  }
  goBack() {
    this.location.back();
  }
  getDesignations(filter = {}) {
    this.loading = true;
    filter['designationInternalStatus-eq'] = 1;
    this.employeesService.getDesignations(filter).subscribe(
      (response: any) => {
        console.log(response);
        this.designationEntities = [...response];
        this.setReportsList();
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  generateYears() {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 10; year--) {
      this.years.push({ label: `${year}`, value: year });
    }
    this.setReportsList();
  }
  setReportsList() {
    let reportsListConfig = [
      {
        reportName: 'Employees',
        reportType: 'EMPLOYEES',
        condition: true,
        fields: [
          {
            field: 'employeeInternalStatus',
            title: 'Employee Status',
            type: 'dropdown',
            filterType: 'eq',
            options: this.employeeStatusList,
            value: 'id',
            label: 'displayName',
          },
          {
            field: 'ofcBranch',
            title: 'Office Branch',
            type: 'dropdown',
            filterType: 'eq',
            options: this.officebranchEntities,
            value: 'id',
            label: 'displayName',
          },
          {
            field: 'designation',
            title: 'Designation',
            type: 'dropdown',
            filterType: 'eq',
            options: this.designationEntities,
            value: 'id',
            label: 'displayName',
          },
          {
            field: 'joiningDate',
            title: 'Joining Date From Date',
            type: 'date',
            filterType: 'gte',
          },
          {
            field: 'joiningDate',
            title: 'Joining Date To Date',
            type: 'date',
            filterType: 'lte',
          },
          {
            field: 'createdOn',
            title: 'Created On From Date',
            type: 'date',
            filterType: 'gte',
          },
          {
            field: 'createdOn',
            title: 'Created On To Date',
            type: 'date',
            filterType: 'lte',
          },
        ],
      },
      {
        reportName: 'Interviews',
        reportType: 'INTERVIEWS',
        condition: true,
        fields: [
          {
            field: 'interviewInternalStatus',
            title: 'Interview Status',
            type: 'dropdown',
            filterType: 'eq',
            options: this.interviewStatusList,
            value: 'id',
            label: 'displayName',
          },
          {
            field: 'scheduledLocation',
            title: 'Scheduled Location',
            type: 'dropdown',
            filterType: 'eq',
            options: this.officebranchEntities,
            value: 'id',
            label: 'displayName',
          },
          {
            field: 'attendedInterview',
            title: 'Attended Interview',
            type: 'dropdown',
            filterType: 'eq',
            options: this.attendedInterviewStatus,
            value: 'id',
            label: 'displayName',
          },
          {
            field: 'createdOn',
            title: 'Created On From Date',
            type: 'date',
            filterType: 'gte',
          },
          {
            field: 'createdOn',
            title: 'Created On To Date',
            type: 'date',
            filterType: 'lte',
          },
        ],
      },
      {
        reportName: 'Salary Sheet',
        reportType: 'SALARYSHEET',
        condition: true,
        fields: [
          {
            field: 'payrollMonth',
            title: 'Payroll Month',
            type: 'month',
            filterType: 'eq',
          },
          {
            field: 'createdOn',
            title: 'Created On From Date',
            type: 'date',
            filterType: 'gte',
          },
          {
            field: 'createdOn',
            title: 'Created On To Date',
            type: 'date',
            filterType: 'lte',
          },
        ],
      },
      {
        reportName: 'Leaves',
        reportType: 'LEAVES',
        condition: true,
        fields: [
          {
            field: 'leaveInternalStatus',
            title: 'Leave Status',
            type: 'dropdown',
            filterType: 'eq',
            options: this.leaveStatusList,
            value: 'id',
            label: 'displayName',
          },
          {
            field: 'leaveType',
            title: 'Leave Type',
            type: 'dropdown',
            filterType: 'eq',
            options: this.leaveTypeEntities,
            value: 'name',
            label: 'displayName',
          },
          {
            field: 'durationType',
            title: 'Duration Type',
            type: 'dropdown',
            filterType: 'eq',
            options: this.durationTypeEntities,
            value: 'name',
            label: 'displayName',
          },
          {
            field: 'createdOn',
            title: 'Created On From Date',
            type: 'date',
            filterType: 'gte',
          },
          {
            field: 'createdOn',
            title: 'Created On To Date',
            type: 'date',
            filterType: 'lte',
          },
        ],
      },
      {
        reportName: 'Holidays',
        reportType: 'HOLIDAYS',
        condition: true,
        fields: [
          {
            field: 'date',
            title: 'Year',
            type: 'dropdown',
            filterType: 'eq',
            options: this.years,
          },
          {
            field: 'createdOn',
            title: 'Created On From Date',
            type: 'date',
            filterType: 'gte',
          },
          {
            field: 'createdOn',
            title: 'Created On To Date',
            type: 'date',
            filterType: 'lte',
          },
        ],
      },
      {
        reportName: 'Attendance',
        reportType: 'ATTENDANCE',
        condition: true,
        fields: [
          {
            field: 'attendanceDate',
            title: 'Attendance Date',
            type: 'date',
            filterType: 'eq',
          },
          {
            field: 'attendanceDate',
            title: 'Attendance From Date',
            type: 'date',
            filterType: 'gte',
          },
          {
            field: 'attendanceDate',
            title: 'Attendance To Date',
            type: 'date',
            filterType: 'lte',
          },
        ],
      },
      {
        reportName: 'Incentives',
        reportType: 'INCENTIVES',
        condition: true,
        fields: [
          {
            field: 'incentiveApplicableMonth',
            title: 'Incentive Month',
            type: 'month',
            filterType: 'eq',
          },
          {
            field: 'createdOn',
            title: 'Created On From Date',
            type: 'date',
            filterType: 'gte',
          },
          {
            field: 'createdOn',
            title: 'Created On To Date',
            type: 'date',
            filterType: 'lte',
          },
        ],
      },
      {
        reportName: 'Salary hikes',
        reportType: 'SALARY_HIKES',
        condition: true,
        fields: [
          {
            field: 'hikeDate',
            title: 'Salary Hike From Date',
            type: 'date',
            filterType: 'gte',
          },
          {
            field: 'hikeDate',
            title: 'Salary Hike To Date',
            type: 'date',
            filterType: 'lte',
          },
          {
            field: 'createdOn',
            title: 'Created On From Date',
            type: 'date',
            filterType: 'gte',
          },
          {
            field: 'createdOn',
            title: 'Created On To Date',
            type: 'date',
            filterType: 'lte',
          },
        ],
      },
      {
        reportName: 'Departments',
        reportType: 'DEPARTMENTS',
        condition: true,
        fields: [
          {
            field: 'designationInternalStatus',
            title: 'Department Status',
            type: 'dropdown',
            filterType: 'eq',
            options: this.departementStatusList,
            value: 'id',
            label: 'displayName',
          },
          {
            field: 'createdOn',
            title: 'Created On From Date',
            type: 'date',
            filterType: 'gte',
          },
          {
            field: 'createdOn',
            title: 'Created On To Date',
            type: 'date',
            filterType: 'lte',
          },
        ],
      },
      {
        reportName: 'Users',
        reportType: 'USERS',
        condition: true,
        fields: [
          {
            field: 'designation',
            title: 'Designation',
            type: 'dropdown',
            filterType: 'eq',
            options: this.designationStatusList,
            value: 'id',
            label: 'displayName',
          },
          {
            field: 'createdOn',
            title: 'Created On From Date',
            type: 'date',
            filterType: 'gte',
          },
          {
            field: 'createdOn',
            title: 'Created On To Date',
            type: 'date',
            filterType: 'lte',
          },
        ],
      },
    ];
    this.selectedReportConfig = reportsListConfig.filter(
      (report) => report.condition && report.reportType == this.reportType
    )[0];
    this.updateBreadcrumb();
    if (!this.isQuestionaire) {
      if (this.selectedReportConfig.addOnReports) {
        delete this.selectedReportConfig.addOnReports;
      }
    }
  }

  getJsonKeys(json) {
    return Object.keys(json);
  }
  routeTo() {}

  generateReport(reportType: string) {
    this.loading = true;
    const selectedReportData = {};
    for (const key in this.reportData) {
      if (this.reportData[key]) {
        selectedReportData[key] = this.reportData[key];
      }
    }
    const apiFilter = {};
    if (this.reportData['createdOn-gte']) {
      apiFilter['createdOn-gte'] = this.moment(
        this.reportData['createdOn-gte']
      ).format('YYYY-MM-DD');
    }
    if (this.reportData['createdOn-lte']) {
      apiFilter['createdOn-lte'] = this.moment(this.reportData['createdOn-lte'])
        .add(1, 'days')
        .format('YYYY-MM-DD');
    }
    if (this.reportData['attendanceDate-gte']) {
      apiFilter['attendanceDate-gte'] = this.moment(
        this.reportData['attendanceDate-gte']
      ).format('YYYY-MM-DD');
    }
    if (this.reportData['attendanceDate-lte']) {
      apiFilter['attendanceDate-lte'] = this.moment(
        this.reportData['attendanceDate-lte']
      ).format('YYYY-MM-DD');
    }
    if (this.reportData['hikeDate-gte']) {
      apiFilter['hikeDate-gte'] = this.moment(
        this.reportData['hikeDate-gte']
      ).format('YYYY-MM-DD');
    }
    if (this.reportData['hikeDate-lte']) {
      apiFilter['hikeDate-lte'] = this.moment(
        this.reportData['hikeDate-lte']
      ).format('YYYY-MM-DD');
    }
    if (this.reportData['joiningDate-gte']) {
      apiFilter['joiningDate-gte'] = this.moment(
        this.reportData['joiningDate-gte']
      ).format('YYYY-MM-DD');
    }
    if (this.reportData['joiningDate-lte']) {
      apiFilter['joiningDate-lte'] = this.moment(
        this.reportData['joiningDate-lte']
      ).format('YYYY-MM-DD');
    }
    if (this.reportData['payrollMonth-eq']) {
      apiFilter['payrollMonth-eq'] = this.moment(
        this.reportData['payrollMonth-eq']
      ).format('YYYY-MM');
    }
    if (this.reportData['incentiveApplicableMonth-eq']) {
      apiFilter['incentiveApplicableMonth-eq'] = this.moment(
        this.reportData['incentiveApplicableMonth-eq']
      ).format('YYYY-MM');
    }
    if (this.reportData['attendanceDate-eq']) {
      apiFilter['attendanceDate-eq'] = this.moment(
        this.reportData['attendanceDate-eq']
      ).format('YYYY-MM-DD');
    }
    if (this.reportData['date-eq']) {
      const startOfYear = this.moment(
        `${this.reportData['date-eq']}-01-01`
      ).format('YYYY-MM-DD');
      const endOfYear = this.moment(
        `${this.reportData['date-eq']}-12-31`
      ).format('YYYY-MM-DD');
      delete selectedReportData['date-eq'];
      apiFilter['date-gte'] = startOfYear;
      apiFilter['date-lte'] = endOfYear;
    }
    Object.assign(selectedReportData, apiFilter);
    console.log(reportType);
    console.log(selectedReportData);
    const reportServiceMap = {
      EMPLOYEES: () =>
        this.employeesService.exportEmployees(selectedReportData),
      INTERVIEWS: () =>
        this.employeesService.exportInterviews(selectedReportData),
      SALARYSHEET: () =>
        this.employeesService.exportSalarySheet(selectedReportData),
      LEAVES: () => this.employeesService.exportLeaves(selectedReportData),
      HOLIDAYS: () => this.employeesService.exportHolidays(selectedReportData),
      INCENTIVES: () =>
        this.employeesService.exportIncentives(selectedReportData),
      SALARY_HIKES: () =>
        this.employeesService.exportSalaryHikes(selectedReportData),
      DEPARTMENTS: () =>
        this.employeesService.exportDesignations(selectedReportData),
      USERS: () => this.employeesService.exportUsers(selectedReportData),
      ATTENDANCE: () =>
        this.employeesService.exportAttendance(selectedReportData),
    };
    const serviceCall = reportServiceMap[reportType];
    if (!serviceCall) {
      this.loading = false;
      this.toastService.showError('Invalid report type');
      return;
    }
    serviceCall().subscribe(
      (response: any) => {
        this.loading = false;
        if (response.success && response.fileUrl) {
          window.open('//' + response.fileUrl, '_blank');
          this.toastService.showSuccess('Report Downloaded Successfully');
        } else {
          this.toastService.showError('Failed to download the report.');
        }
      },
      (error: any) => {
        this.toastService.showError(error);
        this.loading = false;
      }
    );
  }

  onNumberInputChange(event: any) {
    const allowedChars = /[0-9]/g;
    const key = event.key;
    if (!allowedChars.test(key) && key !== 'Backspace') {
      event.preventDefault();
    }
  }
}
