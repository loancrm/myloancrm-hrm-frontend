import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { ToastService } from 'src/app/services/toast.service';
import { EmployeesService } from '../employees/employees.service';
import { RoutingService } from 'src/app/services/routing-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  showSidebar: any = false;
  sidebarVisible: boolean = false;
  birthdayEvents: any[] = [];
  userDetails: any;
  userRoles: any = [];
  searchFilter: any = {};
  employees: any[];
  interviews: any[];
  businessNameToSearch: any;
  currentTableEvent: any;
  todayEventCount: any = 0;
  loading: any;
  capabilities: any;
  constructor(
    private authService: AuthService,
    private routingService: RoutingService,
    private employeesService: EmployeesService,
    private toastService: ToastService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private subscriptionService: SubscriptionService
  ) {}
  ngOnInit(): void {
    this.userDetails =
      this.localStorageService.getItemFromLocalStorage('userDetails');
    this.capabilities = this.employeesService.getUserRbac();
    if (this.userDetails && this.userDetails.user) {
      this.userDetails = this.userDetails.user;
      if (this.capabilities.employee) {
        this.userDetails.passPhoto = JSON.parse(this.userDetails.passPhoto);
      } else {
        this.userDetails.userImage = JSON.parse(this.userDetails.userImage);
      }
    }
    if (!this.capabilities.employee) {
      Promise.all([this.getEmployees(), this.getInterviews()])
        .then(() => {
          this.setBirthdays();
        })
        .catch((error) => {
          console.error('Error loading data:', error);
        });
    }
  }
  userLogout() {
    this.authService
      .doLogout()
      .then(() => {
        this.toastService.showSuccess('Logout Successful');
        this.localStorageService.clearAllFromLocalStorage();
        this.router.navigate(['user', 'login']);
      })
      .catch((error) => {
        this.toastService.showError(error);
      });
  }

  getEmployees(filter = {}) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      filter['employeeInternalStatus-eq'] = 1;
      this.employeesService.getEmployees(filter).subscribe(
        (response: any) => {
          this.employees = response;
          this.loading = false;
          console.log(this.employees);
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

  getInterviews(filter = {}) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      filter['interviewInternalStatus-eq'] = 1;
      this.employeesService.getInterviews(filter).subscribe(
        (response: any) => {
          this.interviews = response;
          this.loading = false;
          console.log(this.interviews);
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

  setBirthdays() {
    if (this.employees && this.employees.length > 0) {
      this.birthdayEvents = [];
      const currentYear = new Date().getFullYear();
      const yearsToDisplay = [currentYear - 1, currentYear, currentYear + 1]; 
      yearsToDisplay.forEach((year) => {
        this.employees.forEach((employee) => {
          const dateOfBirth = new Date(employee.dateOfBirth);
          const birthdayDate = new Date(
            year,
            dateOfBirth.getMonth(),
            dateOfBirth.getDate()
          );
          this.birthdayEvents.push({
            title: `${employee.employeeName}'s Birthday`,
            date: `${birthdayDate.getFullYear()}-${(
              '0' +
              (birthdayDate.getMonth() + 1)
            ).slice(-2)}-${('0' + birthdayDate.getDate()).slice(-2)}`,
            description: `Celebrate ${employee.employeeName}'s birthday!`,
            color: 'purple',
          });
        });
      });
      const interviewEvents = this.interviews
        .filter((employee) => employee.scheduledDate)
        .map((employee) => {
          const scheduledDate = new Date(employee.scheduledDate);
          return {
            title: `${employee.candidateName}'s Interview`,
            date: `${scheduledDate.getFullYear()}-${(
              '0' +
              (scheduledDate.getMonth() + 1)
            ).slice(-2)}-${('0' + scheduledDate.getDate()).slice(-2)}`,
            description: `Interview scheduled for ${employee.candidateName}`,
            color: '#33009C',
          };
        });
      this.birthdayEvents = [...this.birthdayEvents, ...interviewEvents];
      const today = new Date();
      const todayDateString = `${today.getFullYear()}-${(
        '0' +
        (today.getMonth() + 1)
      ).slice(-2)}-${('0' + today.getDate()).slice(-2)}`;
      const todayEvents = this.birthdayEvents.filter(
        (event) => event.date === todayDateString
      );
      this.todayEventCount = todayEvents.length;
      console.log(`Today's event count: ${this.todayEventCount}`);
    } else {
      console.log('No employees found.');
    }
  }

  gotoEvents() {
    this.routingService.handleRoute('events', null);
  }
  showSidebarMenu() {
    this.showSidebar = !this.showSidebar;
    this.subscriptionService.sendMessage({
      ttype: 'showSidebar',
      value: this.showSidebar,
    });
  }
}
