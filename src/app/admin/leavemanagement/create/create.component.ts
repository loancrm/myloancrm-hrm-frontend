import { Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Location } from '@angular/common';
import { ToastService } from 'src/app/services/toast.service';
import { EmployeesService } from '../../employees/employees.service';
import { RoutingService } from 'src/app/services/routing-service';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
import { projectConstantsLocal } from 'src/app/constants/project-constants';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent {
  formFields: any = [];
  breadCrumbItems: any = [];
  leavesData: any;
  moment: any;
  leaveTypeEntities = projectConstantsLocal.LEAVE_TYPE_ENTITIES;
  durationTypeEntities = projectConstantsLocal.DURATION_TYPE_ENTITIES;
  version = projectConstantsLocal.VERSION_DESKTOP;
  userDetails: any;
  leavesId: any;
  leavesForm: UntypedFormGroup;
  activeIndex: number = 0;
  heading: any = 'Create Leave';
  actionType: any = 'create';
  employees: any = [];
  selectedFiles: any = {
    resume: { filesData: [], links: [], uploadedFiles: [] },
  };
  loading: any;
  capabilities: any;
  currentYear: number;
  constructor(
    private location: Location,
    private formBuilder: UntypedFormBuilder,
    private toastService: ToastService,
    private employeesService: EmployeesService,
    private routingService: RoutingService,
    private activatedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private dateTimeProcessor: DateTimeProcessorService
  ) {
    // const usertype = localStorage.getItem('userType');
    const usertype = localStorageService.getItemFromLocalStorage('userType');
    this.moment = this.dateTimeProcessor.getMoment();
    this.activatedRoute.params.subscribe((params) => {
      if (params && params['id']) {
        this.leavesId = params['id'];
        this.actionType = 'update';
        this.heading = 'Update Leave';
        this.getLeaveById().then((data) => {
          if (data) {
            console.log('Leaves Data', this.leavesData);
            this.leavesForm.patchValue({
              employeeName: this.leavesData?.employeeName,
              employeeId: this.leavesData?.employeeId,
              leaveType: this.leavesData?.leaveType,
              durationType: this.leavesData?.durationType,
              leaveFrom: this.leavesData?.leaveFrom,
              leaveTo: this.leavesData?.leaveTo,
              noOfDays: this.leavesData?.noOfDays,
              reason: this.leavesData?.reason,
            });
          }
        });
      }
    });
    this.breadCrumbItems = [
      {
        icon: 'fa fa-house',
        label: ' Dashboard',
        routerLink: `/${usertype}/dashboard`,
        queryParams: { v: this.version },
      },
      {
        label: 'Leave Management',
        routerLink: `/${usertype}/leaves`,
        queryParams: { v: this.version },
      },
      { label: this.actionType == 'create' ? 'Create' : 'Update' },
    ];
  }

  ngOnInit() {
    this.currentYear = this.employeesService.getCurrentYear();
    this.createForm();
    this.setLeavesList();
    const userDetails =
      this.localStorageService.getItemFromLocalStorage('userDetails');
    if (userDetails) {
      this.userDetails = userDetails.user;
    }
    this.capabilities = this.employeesService.getUserRbac();
    console.log('capabilities', this.capabilities);
    this.getEmployees();
    this.leavesForm
      .get('employeeName')
      ?.valueChanges.subscribe((selectedName) => {
        const selectedEmployee = this.employees.find(
          (employee) => employee.employeeName === selectedName
        );
        if (selectedEmployee) {
          this.leavesForm.patchValue({
            employeeId: selectedEmployee.employeeId,
          });
        }
      });
  }

  getEmployees(filter = {}) {
    this.loading = true;
    if (this.actionType === 'create') {
      filter['employeeInternalStatus-eq'] = 1;
    }
    if (this.capabilities.employee) {
      filter['employeeId-eq'] = this.userDetails?.employeeId;
    }
    filter['sort'] = 'joiningDate,asc';
    this.employeesService.getEmployees(filter).subscribe(
      (response) => {
        this.employees = response;
        this.employees = this.employees.map((emp) => ({
          ...emp,
          employeeName: emp.employeeName
            .split(' ')
            .map((word) => {
              if (word.includes('.')) {
                return word
                  .split('.')
                  .map(
                    (part) =>
                      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
                  )
                  .join('.');
              }
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' '),
        }));
        console.log('employees', this.employees);
        this.loading = false;
        this.setLeavesList();
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  setLeavesList() {
    this.formFields = [
      {
        label: 'Employee Name',
        controlName: 'employeeName',
        type: 'dropdown',
        options: 'employees',
        required: true,
        optionLabel: 'employeeName',
        optionValue: 'employeeName',
      },
      {
        label: 'Leave From',
        controlName: 'leaveFrom',
        type: 'calendar',
        required: true,
      },
      {
        label: 'Leave To',
        controlName: 'leaveTo',
        type: 'calendar',
        required: true,
      },
      {
        label: 'Leave Type',
        controlName: 'leaveType',
        type: 'dropdown',
        options: 'leaveTypeEntities',
        required: true,
        optionLabel: 'displayName',
        optionValue: 'name',
      },
      {
        label: 'No Of Days',
        controlName: 'noOfDays',
        type: 'text',
        required: true,
      },
      {
        label: 'Duration Type',
        controlName: 'durationType',
        type: 'dropdown',
        options: 'durationTypeEntities',
        required: true,
        optionLabel: 'displayName',
        optionValue: 'name',
      },
      {
        label: 'Reason',
        controlName: 'reason',
        type: 'textarea',
        required: true,
      },
    ];
  }

  createForm() {
    this.leavesForm = this.formBuilder.group({
      employeeName: ['', Validators.required],
      employeeId: ['', Validators.required],
      leaveType: ['', Validators.required],
      durationType: ['', Validators.required],
      leaveFrom: ['', Validators.required],
      leaveTo: ['', Validators.required],
      noOfDays: ['', Validators.required],
      reason: ['', Validators.required],
    });
  }

  onSubmit(formValues) {
    let formData: any = {
      employeeName: formValues.employeeName,
      leaveFrom: formValues.leaveFrom
        ? this.moment(formValues.leaveFrom).format('YYYY-MM-DD')
        : null,
      employeeId: formValues.employeeId,
      leaveType: formValues.leaveType,
      durationType: formValues.durationType,
      noOfDays: formValues.noOfDays,
      // reason: formValues.reason,
      // reason: formValues.reason ? formValues.reason.replace(/\s+/g, ' ').trim() : null,
      reason: formValues.reason ? formValues.reason.replace(/['"]/g, '').replace(/\s+/g, ' ').trim() : null,
      leaveTo: formValues.leaveTo
        ? this.moment(formValues.leaveTo).format('YYYY-MM-DD')
        : null,
    };

    console.log('formData', formData);
    if (this.actionType == 'create') {
      this.loading = true;
      this.employeesService.createLeave(formData).subscribe(
        (data) => {
          if (data) {
            this.loading = false;
            this.toastService.showSuccess('Leave Added Successfully');
            this.routingService.handleRoute('leaves', null);
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
      this.employeesService.updateLeave(this.leavesId, formData).subscribe(
        (data) => {
          if (data) {
            this.loading = false;
            this.toastService.showSuccess('Leaves Updated Successfully');
            this.routingService.handleRoute('leaves', null);
          }
        },
        (error: any) => {
          this.loading = false;
          this.toastService.showError(error);
        }
      );
    }
  }

  getLeaveById(filter = {}) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.employeesService.getLeaveById(this.leavesId, filter).subscribe(
        (response) => {
          this.leavesData = response;
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
