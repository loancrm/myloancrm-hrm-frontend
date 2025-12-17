import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { EmployeesService } from '../employees/employees.service';
import { ToastService } from 'src/app/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsGuard implements CanActivate {
  constructor(
    private employeesService: EmployeesService,
    private router: Router,
    private toastService: ToastService
  ) {}

  canActivate(): boolean | UrlTree {
    const capabilities: any = this.employeesService.getUserRbac();
    
    if (!capabilities?.showSettings) {
      this.toastService.showError('You do not have permission to access Settings.');
      return this.router.createUrlTree(['/user/dashboard']);
    }
    
    return true;
  }
}

