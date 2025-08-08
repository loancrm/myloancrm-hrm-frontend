import { Component, OnInit } from '@angular/core';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { Location } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { EmployeesService } from '../../employees/employees.service';
import { RoutingService } from 'src/app/services/routing-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit {
  breadCrumbItems: any = [];
  heading: any = 'Create Department';
  actionType: any = 'create';
  loading: any;
  selectedCheckboxes: { [key: string]: string[] } = {};
  modules: any;
  designationId: any;
  formFields: any = [];
  departmentData: any;
  departmentsForm: UntypedFormGroup;
  version = projectConstantsLocal.VERSION_DESKTOP;
  constructor(
    private location: Location,
    private employeesService: EmployeesService,
    private formBuilder: UntypedFormBuilder,
    private routingService: RoutingService,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((params) => {
      if (params && params['id']) {
        this.designationId = params['id'];
        this.actionType = 'update';
        this.heading = 'Update Department';
        this.getDesignationsById().then((data) => {
          if (data) {
            console.log('Department Data', this.departmentData);
            this.departmentsForm.patchValue({
              designation: this.departmentData?.designation,
              displayName: this.departmentData?.displayName,
            });
            this.patchRbacValues(this.departmentData.rbac);
          }
        });
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
        label: 'Departments',
        routerLink: '/user/designations',
        queryParams: { v: this.version },
      },
      { label: this.actionType == 'create' ? 'Create' : 'Update' },
    ];
    this.modules = [
      // {
      //   name: 'Employees',
      //   options: [
      //     { label: 'Admin Employees', value: 'adminEmployees' },
      //     { label: 'Employee Profile', value: 'employee' },
      //   ],
      //   type: 'radio',
      // },
      {
        name: 'Attendance',
        options: [
          { label: 'Admin Attendance', value: 'adminAttendance' },
          { label: 'Employee Attendance', value: 'employeeAttendance' },
        ],
        type: 'radio',
      },
      {
        name: 'Payroll',
        options: [
          { label: 'Admin Payroll', value: 'adminPayroll' },
          { label: 'Employee Payroll', value: 'employeePayroll' },
        ],
        type: 'radio',
      },
      {
        name: 'Leaves',
        options: [
          { label: 'Admin Leaves', value: 'adminLeaves' },
          { label: 'Employee Leaves', value: 'employeeLeaves' },
        ],
        type: 'radio',
      },
      {
        name: 'Incentives',
        options: [
          { label: 'Admin Incentives', value: 'adminIncentives' },
          { label: 'Employee Incentives', value: 'employeeIncentives' },
        ],
        type: 'radio',
      },
      {
        name: 'Salary Hikes',
        options: [
          {
            label: 'Admin Salary Hikes',
            value: 'adminSalaryHikes',
          },
          {
            label: 'Employee Salary Hikes',
            value: 'employeeSalaryHikes',
          },
        ],
        type: 'radio',
      },
      {
        name: 'Profile',
        options: [{ label: 'Employee Profile', value: 'employee' }],
        type: 'checkbox',
      },
      {
        name: 'Interviews',
        options: [{ label: 'Interviews', value: 'interviews' }],
        type: 'checkbox',
      },
      {
        name: 'Departments',
        options: [{ label: 'Departments', value: 'departments' }],
        type: 'checkbox',
      },
      {
        name: 'Holidays',
        options: [{ label: 'Holidays', value: 'holidays' }],
        type: 'checkbox',
      },
      {
        name: 'Reports',
        options: [{ label: 'Reports', value: 'reports' }],
        type: 'checkbox',
      },
      {
        name: 'Users',
        options: [{ label: 'Users', value: 'users' }],
        type: 'checkbox',
      },
      {
        name: 'Events',
        options: [{ label: 'Events', value: 'events' }],
        type: 'checkbox',
      },
    ];
  }

  ngOnInit(): void {
    this.createForm();
    this.setDepartmentsList();
  }
  setDepartmentsList() {
    this.formFields = [
      {
        label: 'Department Name',
        controlName: 'displayName',
        type: 'text',
        required: true,
      },
      {
        label: 'Designation Name',
        controlName: 'designation',
        type: 'text',
        required: true,
      },
    ];
  }

  createForm() {
    this.departmentsForm = this.formBuilder.group({
      displayName: ['', Validators.required],
      designation: ['', Validators.required],
      rbac: this.formBuilder.array([]), // Ensure it's an empty FormArray
    });
    this.initRbacControls();
  }

  // initRbacControls() {
  //   const rbacFormArray = this.departmentsForm.get('rbac') as FormArray;

  //   this.modules.forEach((module) => {
  //     const group = this.formBuilder.group({});
  //     module.options.forEach((option) => {
  //       group.addControl(option.value, new FormControl(false)); // Default is unchecked for checkboxes
  //     });
  //     rbacFormArray.push(group);
  //   });
  // }
  initRbacControls() {
    const rbacFormArray = this.departmentsForm.get('rbac') as FormArray;

    this.modules.forEach((module) => {
      let group;

      if (module.type === 'radio') {
        group = this.formBuilder.group({
          selectedOption: [null], // Initialize with null or default value
        });
      } else if (module.type === 'checkbox') {
        group = this.formBuilder.group({});
        module.options.forEach((option) => {
          group.addControl(option.value, new FormControl(false)); // Default to unchecked
        });
      }

      rbacFormArray.push(group);
    });
  }

  onSubmit(formValues) {
    const rbacValues = (
      this.departmentsForm.get('rbac') as FormArray
    ).value.map((group, index) => {
      const module = this.modules[index];

      if (module.type === 'radio') {
        // Extract the selected radio button value
        return group.selectedOption;
      } else if (module.type === 'checkbox') {
        // Extract the selected checkboxes
        return Object.keys(group).filter((key) => group[key]);
      }
      return null;
    });

    const rbacCombined = rbacValues.flat().filter(Boolean).join(',');
    const formData = {
      displayName: formValues.displayName,
      designation: formValues.designation,
      rbac: rbacCombined,
    };
    console.log('formData', formData);
    if (this.actionType == 'create') {
      this.loading = true;
      this.employeesService.createDesignation(formData).subscribe(
        (data) => {
          if (data) {
            this.loading = false;
            this.toastService.showSuccess('Department Added Successfully');
            this.routingService.handleRoute('designations', null);
          }
        },
        (error: any) => {
          this.loading = false;
          console.log(error);
          this.toastService.showError(error);
        }
      );
    } else if (this.actionType == 'update') {
      this.loading = true;
      console.log(formData);
      this.employeesService
        .updateDesignation(this.designationId, formData)
        .subscribe(
          (data) => {
            if (data) {
              this.loading = false;
              this.toastService.showSuccess('Department Updated Successfully');
              this.routingService.handleRoute('designations', null);
            }
          },
          (error: any) => {
            this.loading = false;
            this.toastService.showError(error);
          }
        );
    }
  }

  patchRbacValues(rbacValues: string) {
    const rbacArray = rbacValues.split(',');
    const rbacFormArray = this.departmentsForm.get('rbac') as FormArray;

    this.modules.forEach((module, moduleIndex) => {
      const group = rbacFormArray.at(moduleIndex) as FormGroup;

      if (module.type === 'radio') {
        // Find the selected radio button value
        const selectedOption = module.options.find((option) =>
          rbacArray.includes(option.value)
        );
        if (selectedOption) {
          group.get('selectedOption')?.setValue(selectedOption.value); // Set the value for the radio group
        }
      }

      if (module.type === 'checkbox') {
        module.options.forEach((option) => {
          const isChecked = rbacArray.includes(option.value);
          group.get(option.value)?.setValue(isChecked); // Patch checkbox state
        });
      }
    });
  }

  getDesignationsById(filter = {}) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.employeesService
        .getDesignationsById(this.designationId, filter)
        .subscribe(
          (response) => {
            this.departmentData = response;
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
  goBack() {
    this.location.back();
  }
}
