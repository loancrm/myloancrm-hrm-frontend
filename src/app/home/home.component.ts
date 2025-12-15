import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeesService } from '../admin/employees/employees.service';
import { CompanySettingsService } from '../services/company-settings.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  text = 'Hello, World!';
  currentYear: number;
  companySettings: any;
  constructor(private employeesService: EmployeesService, private companySettingsService: CompanySettingsService) {}
  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
    this.getCompanySettings();
  }
  
  getCompanySettings() {
    this.companySettingsService.getCompanySettings().subscribe((response: any) => {
      this.companySettings = response || {};
    });
  }
}
