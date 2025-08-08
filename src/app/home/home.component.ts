import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeesService } from '../admin/employees/employees.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  text = 'Hello, World!';
  currentYear: number;
  constructor(private employeesService: EmployeesService) {}
  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
  }
}
