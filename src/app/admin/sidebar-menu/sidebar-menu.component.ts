import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Sidebar } from 'primeng/sidebar';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { RoutingService } from 'src/app/services/routing-service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { ToastService } from 'src/app/services/toast.service';
import { SubSink } from 'subsink';
import { EmployeesService } from '../employees/employees.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
})
export class SidebarMenuComponent implements OnChanges {
  @Input() showSidebar;
  @ViewChild('sidebarMenu') sidebarMenu: Sidebar;
  @ViewChild('sidebarContainer') sidebarContainer: ElementRef;
  sidebarVisible: any;
  userDetails: any;
  userRoles: any = [];
  capabilities: any;
  subscription: Subscription;
  private subs = new SubSink();
  iswiz = false;
  minimizeMenu = false;
  showMenu = false;
  version = projectConstantsLocal.VERSION_DESKTOP;
  featureMenuItems: any = [];
  subFeatureMenuItems: any = [];
  moreFeatureMenuItems: any = [];
  constructor(
    private subscriptionService: SubscriptionService,
    private renderer: Renderer2,
    private employeesService: EmployeesService,
    private authService: AuthService,
    private routingService: RoutingService,
    private toastService: ToastService,
    private localStorage: LocalStorageService,
    private router: Router,

    private localStorageService: LocalStorageService
  ) {
    this.subs.sink = this.subscriptionService
      .getMessage()
      .subscribe((message) => {
        switch (message.ttype) {
          case 'showSidebar':
            this.sidebarVisible = message.value;
            break;
        }
        this.setMenuItems();
      });
  }

  closeMenu() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 767) {
      this.renderer.removeClass(document.body, 'sidebar-open');
    }
  }

  dashboardClicked() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 767) {
      this.renderer.removeClass(document.body, 'sidebar-open');
    }
  }

  ngOnInit() {
    this.getGlobalSettings().then(() => {
      this.setMenuItems();
    });
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
    console.log(this.userDetails);
  }

  setMenuItems() {
    this.subFeatureMenuItems = [
      {
        name: 'Dashboard',
        condition: true,
        routerLink: 'dashboard',
        image: 'dashboard.gif',
        thumbnail: 'home-color.png',
        showOutside: true,
      },
      {
        name: 'Employees',
        condition: this.capabilities.adminEmployees,
        routerLink: 'employees',
        image: 'employees.gif',
        thumbnail: 'employees.png',
        showOutside: this.capabilities.adminEmployees,
      },

      {
        name: 'Interviews',
        condition: this.capabilities.interviews,
        routerLink: 'interviews',
        image: 'interviews.gif',
        thumbnail: 'interviews.png',
        showOutside: this.capabilities.interviews,
      },
      {
        name: 'Attendance',
        condition:
          this.capabilities.adminAttendance ||
          this.capabilities.employeeAttendance,
        routerLink: 'attendance',
        image: 'attendance.gif',
        thumbnail: 'attendance.png',
        showOutside:
          this.capabilities.adminAttendance ||
          this.capabilities.employeeAttendance,
      },
      {
        name: 'Payroll',
        condition:
          this.capabilities.adminPayroll || this.capabilities.employeePayroll,
        routerLink: 'payroll',
        image: 'payroll.gif',
        thumbnail: 'payroll.png',
        showOutside:
          this.capabilities.adminPayroll || this.capabilities.employeePayroll,
      },

      {
        name: 'Leave Management',
        condition:
          this.capabilities.adminLeaves || this.capabilities.employeeLeaves,
        routerLink: 'leaves',
        image: 'leaves.gif',
        thumbnail: 'leaves.png',
        showOutside:
          this.capabilities.adminLeaves || this.capabilities.employeeLeaves,
      },
      {
        name: 'Holidays',
        condition: this.capabilities.holidays,
        routerLink: 'holidays',
        image: 'holidays.gif',
        thumbnail: 'holidays.png',
        showOutside: this.capabilities.holidays,
      },
      {
        name: 'Incentives',
        condition:
          this.capabilities.adminIncentives ||
          this.capabilities.employeeIncentives,
        routerLink: 'incentives',
        image: 'incentives.gif',
        thumbnail: 'incentives.png',
        showOutside:
          this.capabilities.adminIncentives ||
          this.capabilities.employeeIncentives,
      },
      {
        name: 'Departments',
        condition: this.capabilities.departments,
        routerLink: 'designations',
        image: 'departments.gif',
        thumbnail: 'departments.png',
        showOutside: this.capabilities.departments,
      },
      {
        name: 'Salary Hikes',
        condition:
          this.capabilities.adminSalaryHikes ||
          this.capabilities.employeeSalaryHikes,
        routerLink: 'salaryhikes',
        image: 'salaryhike.gif',
        thumbnail: 'salaryhike.png',
        showOutside:
          this.capabilities.adminSalaryHikes ||
          this.capabilities.employeeSalaryHikes,
      },
      {
        name: 'Events',
        condition: this.capabilities.events,
        routerLink: 'events',
        image: 'events.gif',
        thumbnail: 'events.png',
        showOutside: this.capabilities.events,
      },
      {
        name: 'Users',
        condition: this.capabilities.users,
        // condition: true,
        // condition:
        //   this.userDetails?.designation == 1 ||
        //   this.userDetails?.designation == 4,
        routerLink: 'users',
        image: 'users.gif',
        thumbnail: 'users.png',
        showOutside: this.capabilities.users,
        // showOutside: true,
        // showOutside:
        //   this.userDetails?.designation == 1 ||
        //   this.userDetails?.designation == 4,
      },
      {
        name: 'Reports',
        condition: this.capabilities.reports,
        routerLink: 'reports',
        image: 'reports.gif',
        thumbnail: 'reports.png',
        showOutside: this.capabilities.reports,
      },
      {
        name: 'Ip Address',
        condition: this.capabilities.ipAddress,
        routerLink: 'ipAddress',
        image: 'ip.gif',
        thumbnail: 'ip.png',
        showOutside: this.capabilities.ipAddress,
      },
      {
        name: 'Settings',
        condition: true,
        routerLink: 'settings',
        image: 'settings.gif',
        thumbnail: 'settings.png',
        showOutside: false,
      },
    ];
  }

  // setMenuItems() {
  //   const userDesignation = this.userDetails?.designation;
  //   const isEmployee = this.capabilities?.employee;
  //   const employeeMenuItems = [
  //     {
  //       name: 'Dashboard',
  //       routerLink: 'dashboard',
  //       image: 'dashboard.gif',
  //       thumbnail: 'home-color.png',
  //       showOutside: true,
  //       condition: true,
  //     },
  //     {
  //       name: 'Attendance',
  //       routerLink: 'attendance',
  //       image: 'attendance.gif',
  //       thumbnail: 'attendance.png',
  //       showOutside: true,
  //       condition: true,
  //     },
  //     {
  //       name: 'Payroll',
  //       routerLink: 'payroll',
  //       image: 'payroll.gif',
  //       thumbnail: 'payroll.png',
  //       showOutside: true,
  //       condition: true,
  //     },
  //     {
  //       name: 'Leave Management',
  //       routerLink: 'leaves',
  //       image: 'leaves.gif',
  //       thumbnail: 'leaves.png',
  //       showOutside: true,
  //       condition: true,
  //     },
  //     {
  //       name: 'Salary Hikes',
  //       routerLink: 'salaryhikes',
  //       image: 'salaryhike.gif',
  //       thumbnail: 'salaryhike.png',
  //       showOutside: true,
  //       condition: true,
  //     },
  //     {
  //       name: 'Incentives',
  //       routerLink: 'incentives',
  //       image: 'incentives.gif',
  //       thumbnail: 'incentives.png',
  //       showOutside: true,
  //       condition: true,
  //     },
  //     {
  //       name: 'Holidays',
  //       routerLink: 'holidays',
  //       image: 'holidays.gif',
  //       thumbnail: 'holidays.png',
  //       showOutside: true,
  //       condition: true,
  //     },
  //     {
  //       name: 'Settings',
  //       condition: true,
  //       routerLink: 'settings',
  //       image: 'settings.gif',
  //       thumbnail: 'settings.png',
  //       showOutside: false,
  //     },
  //   ];
  //   // Define menu items for others (non-employees)
  //   const nonEmployeeMenuItems = [
  //     {
  //       name: 'Dashboard',
  //       condition: true,
  //       routerLink: 'dashboard',
  //       image: 'dashboard.gif',
  //       thumbnail: 'home-color.png',
  //       showOutside: true,
  //     },
  //     {
  //       name: 'Employees',
  //       condition: true,
  //       routerLink: 'employees',
  //       image: 'employees.gif',
  //       thumbnail: 'employees.png',
  //       showOutside: true,
  //     },

  //     {
  //       name: 'Interviews',
  //       condition: true,
  //       routerLink: 'interviews',
  //       image: 'interviews.gif',
  //       thumbnail: 'interviews.png',
  //       showOutside: true,
  //     },
  //     {
  //       name: 'Attendance',
  //       condition: true,
  //       routerLink: 'attendance',
  //       image: 'attendance.gif',
  //       thumbnail: 'attendance.png',
  //       showOutside: true,
  //     },
  //     {
  //       name: 'Payroll',
  //       condition: true,
  //       routerLink: 'payroll',
  //       image: 'payroll.gif',
  //       thumbnail: 'payroll.png',
  //       showOutside: true,
  //     },

  //     {
  //       name: 'Leave Management',
  //       condition: true,
  //       routerLink: 'leaves',
  //       image: 'leaves.gif',
  //       thumbnail: 'leaves.png',
  //       showOutside: true,
  //     },
  //     {
  //       name: 'Holidays',
  //       condition: true,
  //       routerLink: 'holidays',
  //       image: 'holidays.gif',
  //       thumbnail: 'holidays.png',
  //       showOutside: true,
  //     },
  //     {
  //       name: 'Incentives',
  //       condition: true,
  //       routerLink: 'incentives',
  //       image: 'incentives.gif',
  //       thumbnail: 'incentives.png',
  //       showOutside: true,
  //     },
  //     {
  //       name: 'Departments',
  //       condition: true,
  //       routerLink: 'designations',
  //       image: 'departments.gif',
  //       thumbnail: 'departments.png',
  //       showOutside: true,
  //     },
  //     {
  //       name: 'Salary Hikes',
  //       condition: true,
  //       routerLink: 'salaryhikes',
  //       image: 'salaryhike.gif',
  //       thumbnail: 'salaryhike.png',
  //       showOutside: true,
  //     },
  //     {
  //       name: 'Events',
  //       condition: true,
  //       routerLink: 'events',
  //       image: 'events.gif',
  //       thumbnail: 'events.png',
  //       showOutside: true,
  //     },
  //     {
  //       name: 'Users',
  //       // condition: true,
  //       condition:
  //         this.userDetails?.designation == 1 ||
  //         this.userDetails?.designation == 4,
  //       routerLink: 'users',
  //       image: 'users.gif',
  //       thumbnail: 'users.png',
  //       // showOutside: true,
  //       showOutside:
  //         this.userDetails?.designation == 1 ||
  //         this.userDetails?.designation == 4,
  //     },
  //     {
  //       name: 'Reports',
  //       condition: true,
  //       routerLink: 'reports',
  //       image: 'reports.gif',
  //       thumbnail: 'reports.png',
  //       showOutside: true,
  //     },
  //     {
  //       name: 'Settings',
  //       condition: true,
  //       routerLink: 'settings',
  //       image: 'settings.gif',
  //       thumbnail: 'settings.png',
  //       showOutside: false,
  //     },
  //   ];
  //   this.subFeatureMenuItems = isEmployee
  //     ? employeeMenuItems
  //     : nonEmployeeMenuItems;
  // }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  getProviderSettings() {}

  getGlobalSettings() {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  minimizeSideBar() {
    this.minimizeMenu = !this.minimizeMenu;
    console.log(this.minimizeMenu);
    this.subscriptionService.sendMessage({
      ttype: 'smallMenu',
      value: this.minimizeMenu,
    });
  }

  gotoActiveHome() {
    this.routingService.setFeatureRoute(null);
    this.routingService.handleRoute('', null);
  }

  showSidebarMenu(event) {
    this.sidebarVisible = event;
  }

  ngOnChanges(changes) {
    if (changes && changes.showSidebar) {
      if (this.sidebarMenu && !this.sidebarMenu.visible) {
        this.sidebarVisible = true;
      } else {
        this.sidebarVisible = false;
      }
    }
  }

  showMenuSection() {
    this.sidebarVisible = false;
    this.showMenu = false;
    this.subscriptionService.sendMessage({
      ttype: 'showmenu',
      value: this.showMenu,
    });
  }

  enableOrDisableSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  userLogout() {
    this.authService
      .doLogout()
      .then(() => {
        this.toastService.showSuccess('Logout Successful');
        this.localStorage.clearAllFromLocalStorage();
        this.router.navigate(['user', 'login']);
      })
      .catch((error) => {
        this.toastService.showError(error);
      });
  }
  gotoAccountProfile() {}
}
