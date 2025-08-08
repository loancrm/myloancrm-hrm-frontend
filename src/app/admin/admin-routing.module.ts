import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'employees',
        loadChildren: () =>
          import('./employees/employees.module').then((m) => m.EmployeesModule),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./users/users.module').then((m) => m.UsersModule),
      },
      {
        path: 'interviews',
        loadChildren: () =>
          import('./interviews/interviews.module').then(
            (m) => m.InterviewsModule
          ),
      },
      {
        path: 'payroll',
        loadChildren: () =>
          import('./payroll/payroll.module').then((m) => m.PayrollModule),
      },
      {
        path: 'attendance',
        loadChildren: () =>
          import('./attendance/attendance.module').then(
            (m) => m.AttendanceModule
          ),
      },
      {
        path: 'holidays',
        loadChildren: () =>
          import('./holidays/holidays.module').then((m) => m.HolidaysModule),
      },
      {
        path: 'incentives',
        loadChildren: () =>
          import('./incentives/incentives.module').then(
            (m) => m.IncentivesModule
          ),
      },
      {
        path: 'designations',
        loadChildren: () =>
          import('./designations/designations.module').then(
            (m) => m.DesignationsModule
          ),
      },
      {
        path: 'salaryhikes',
        loadChildren: () =>
          import('./salaryhike/salaryhike.module').then(
            (m) => m.SalaryhikeModule
          ),
      },
      {
        path: 'events',
        loadChildren: () =>
          import('./events/events.module').then((m) => m.EventsModule),
      },
      {
        path: 'leaves',
        loadChildren: () =>
          import('./leavemanagement/leavemanagement.module').then(
            (m) => m.LeavemanagementModule
          ),
      },
      {
        path: 'ipAddress',
        loadChildren: () =>
          import('./ipaddress/ipaddress.module').then((m) => m.IpaddressModule),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./reports/reports.module').then((m) => m.ReportsModule),
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
