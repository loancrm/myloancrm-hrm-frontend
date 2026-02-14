import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { RoutingService } from 'src/app/services/routing-service';
import { NavigationExtras } from '@angular/router';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { EmployeesService } from '../employees/employees.service';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent {
  reportsListConfig: any = [];
  loading: any;
  breadCrumbItems: any = [];
  version = projectConstantsLocal.VERSION_DESKTOP;
  currentYear: number;
  constructor(
    private routingService: RoutingService,
    private location: Location,
    private employeesService: EmployeesService,
  ) {
    this.breadCrumbItems = [
      {
        icon: 'fa fa-house',
        label: '  Dashboard',
        routerLink: '/user/dashboard',
        queryParams: { v: this.version },
      },
      { label: 'Reports' },
    ];
  }
  ngOnInit() {
    this.currentYear = this.employeesService.getCurrentYear();
    this.setReportsList();
  }
  setReportsList() {
    let reportsListConfig = [
      {
        reportName: 'Employees',
        name: 'employees',
        icon:'id-card-lanyard',
        reportType: 'EMPLOYEES',
        condition: true,
      },
      {
        reportName: 'Interviews',
        name: 'interviews',
        icon:'messages-square',
        reportType: 'INTERVIEWS',
        condition: true,
      },
      {
        reportName: 'Attendance',
        name: 'attendance',
        icon:'calendar-check',
        reportType: 'ATTENDANCE',
        condition: true,
      },
      {
        reportName: 'Salary Sheet',
        icon:'notepad-text',
        name: 'payroll',
        reportType: 'SALARYSHEET',
        condition: true,
      },
      {
        reportName: 'Leaves',
        name: 'leaves',
        icon:'calendar-clock',
        reportType: 'LEAVES',
        condition: true,
      },
      {
        reportName: 'Holidays',
        icon:'cable-car',
        name: 'holidays',
        reportType: 'HOLIDAYS',
        condition: true,
      },
      {
        reportName: 'Incentives',
        name: 'incentives',
        icon:'gift',
        reportType: 'INCENTIVES',
        condition: true,
      },
      {
        reportName: 'Salary Hikes',
        name: 'salaryhike',
        icon:'banknote-arrow-up',
        reportType: 'SALARY_HIKES',
        condition: true,
      },
      {
        reportName: 'Departments',
        name: 'departments',
        icon:'landmark',
        reportType: 'DEPARTMENTS',
        condition: true,
      },
      {
        reportName: 'Users',
        name: 'users',
        icon:'users',
        reportType: 'USERS',
        condition: true,
      },
    ];
    this.reportsListConfig = reportsListConfig.filter(
      (report) => report.condition
    );
  }

  createReport(reportType) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        reportType: reportType,
      },
    };
    this.routingService.handleRoute('reports/create', navigationExtras);
  }

  viewAllReports() {
    this.routingService.handleRoute('reports/report-list', null);
  }

  goBack() {
    this.location.back();
  }
}
