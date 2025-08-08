import { Component, OnInit } from '@angular/core';
import { EmployeesService } from '../employees/employees.service';
import { Location } from '@angular/common';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { ToastService } from 'src/app/services/toast.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import {
  FormArray,
  FormControl,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { RoutingService } from 'src/app/services/routing-service';
@Component({
  selector: 'app-designations',
  templateUrl: './designations.component.html',
  styleUrls: ['./designations.component.scss'],
})
export class DesignationsComponent implements OnInit {
  breadCrumbItems: any = [];
  formFields: any = [];
  loading: any;
  apiLoading: any;
  appliedFilter: {};
  departmentData: any;
  filterConfig: any[] = [];
  totalDesignationsCount: any = 0;

  designationId: any;
  searchFilter: any = {};
  displayNameToSearch: any;
  isDialogVisible = false;
  designations: any = [];
  currentTableEvent: any;
  // departmentsForm: UntypedFormGroup;
  // heading: any = 'Create Department';
  // actionType: any = 'create';
  departmentInternalStatusList: any = projectConstantsLocal.DEPARTMENT_STATUS;
  selectedDepartmentStatus = this.departmentInternalStatusList[1];
  version = projectConstantsLocal.VERSION_DESKTOP;
  capabilities: any;
  // selectedCheckboxes: { [key: string]: string[] } = {};
  // modules: any;

  currentYear: number;
  constructor(
    private employeesService: EmployeesService,
    private location: Location,
    private routingService: RoutingService,
    private formBuilder: UntypedFormBuilder,
    private localStorageService: LocalStorageService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) {
    this.breadCrumbItems = [
      {
        icon: 'fa fa-house',
        label: '  Dashboard',
        routerLink: '/user/dashboard',
        queryParams: { v: this.version },
      },
      { label: 'Departments' },
    ];
    // this.modules = [
    //   {
    //     name: 'Attendance',
    //     options: [
    //       { label: 'Admin Attendance', value: 'adminAttendance' },
    //       { label: 'Employee Attendance', value: 'employeeAttendance' },
    //     ],
    //     type: 'radio',
    //     value: null, // This will store the selected value
    //   },
    //   {
    //     name: 'Payroll',
    //     options: [
    //       { label: 'Admin Payroll', value: 'adminPayroll' },
    //       { label: 'Employee Payroll', value: 'employeePayroll' },
    //     ],
    //     type: 'radio',
    //   },
    //   {
    //     name: 'Leaves',
    //     options: [
    //       { label: 'Admin Leaves', value: 'adminLeaves' },
    //       { label: 'Employee Leaves', value: 'employeeLeaves' },
    //     ],
    //     type: 'radio',
    //   },
    //   {
    //     name: 'Incentives',
    //     options: [
    //       { label: 'Admin Incentives', value: 'adminIncentives' },
    //       { label: 'Employee Incentives', value: 'employeeIncentives' },
    //     ],
    //     type: 'radio',
    //   },
    //   {
    //     name: 'Salary Hikes',
    //     options: [
    //       {
    //         id: 'salary',
    //         label: 'Admin Salary Hikes',
    //         value: 'adminSalaryHikes',
    //       },
    //       {
    //         id: 'salary',
    //         label: 'Employee Salary Hikes',
    //         value: 'employeeSalaryHikes',
    //       },
    //     ],
    //     type: 'radio',
    //   },
    //   {
    //     name: 'Interviews',
    //     options: [{ label: 'Interviews', value: 'interviews' }],
    //     type: 'checkbox',
    //   },
    //   {
    //     name: 'Departments',
    //     options: [{ label: 'Departments', value: 'departments' }],
    //     type: 'checkbox',
    //   },
    //   {
    //     name: 'Holidays',
    //     options: [{ label: 'Holidays', value: 'holidays' }],
    //     type: 'checkbox',
    //   },
    //   {
    //     name: 'Reports',
    //     options: [{ label: 'Reports', value: 'reports' }],
    //     type: 'checkbox',
    //   },
    //   {
    //     name: 'Users',
    //     options: [{ label: 'Users', value: 'users' }],
    //     type: 'checkbox',
    //   },
    //   {
    //     name: 'Events',
    //     options: [{ label: 'Events', value: 'events' }],
    //     type: 'checkbox',
    //   },
    // ];
  }
  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
    this.capabilities = this.employeesService.getUserRbac();
    console.log('capabilities', this.capabilities);
    this.setFilterConfig();
    // this.createForm();
    // this.setDepartmentsList();
    const storedFilter = this.localStorageService.getItemFromLocalStorage(
      'selectedDepartmentStatus'
    );
    if (storedFilter) {
      this.selectedDepartmentStatus = storedFilter;
    }
    const storedAppliedFilter =
      this.localStorageService.getItemFromLocalStorage(
        'departmentsAppliedFilter'
      );
    if (storedAppliedFilter) {
      this.appliedFilter = storedAppliedFilter;
    }
  }
  // createForm() {
  //   this.departmentsForm = this.formBuilder.group({
  //     displayName: ['', Validators.required],
  //     designation: ['', Validators.required],

  //     rbac: this.formBuilder.array(
  //       this.modules.map((module) => {
  //         const group = {};
  //         // Handle radio buttons with one control per module
  //         if (module.type === 'radio') {
  //           group[module.name] = [null]; // Initialize with null or a default value
  //         }
  //         // Handle checkboxes
  //         module.options.forEach((option) => {
  //           group[option.value] = [false]; // Initialize all checkboxes as false
  //         });
  //         return this.formBuilder.group(group);
  //       })
  //     ),
  //   });
  //   this.initRbacControls();
  // }

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
  // initRbacControls() {
  //   const rbacFormArray = this.departmentsForm.get('rbac') as FormArray;

  //   this.modules.forEach((module) => {
  //     const group = this.formBuilder.group({});

  //     if (module.type === 'radio') {
  //       // Create a FormControl for each radio option
  //       module.options.forEach((option) => {
  //         group.addControl(option.value, new FormControl(false)); // Default value: radio not selected
  //       });
  //     } else if (module.type === 'checkbox') {
  //       // Add controls for checkboxes
  //       module.options.forEach((option) => {
  //         group.addControl(option.value, new FormControl(false)); // Default to false for unchecked
  //       });
  //     }

  //     rbacFormArray.push(group);
  //   });
  // }

  setFilterConfig() {
    this.filterConfig = [
      {
        header: 'Department Id',
        data: [
          {
            field: 'designationId',
            title: 'Department Id',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Designation Name',
        data: [
          {
            field: 'displayName',
            title: 'Designation Name',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Created Date Range',
        data: [
          {
            field: 'createdOn',
            title: 'From',
            type: 'date',
            filterType: 'gte',
          },
          { field: 'createdOn', title: 'To', type: 'date', filterType: 'lte' },
        ],
      },
      {
        header: 'Department',
        data: [
          {
            field: 'designation',
            title: 'Department',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'created On  ',
        data: [
          {
            field: 'createdOn',
            title: 'Date ',
            type: 'date',
            filterType: 'like',
          },
        ],
      },
    ];
  }

  // setDepartmentsList() {
  //   this.formFields = [
  //     {
  //       label: 'Department Name',
  //       controlName: 'displayName',
  //       type: 'text',
  //       required: true,
  //     },
  //     {
  //       label: 'Designation Name',
  //       controlName: 'designation',
  //       type: 'text',
  //       required: true,
  //     },
  //   ];
  // }
  inputValueChangeEvent(dataType, value) {
    if (value == '') {
      this.searchFilter = {};
      console.log(this.currentTableEvent);
      this.loadDesignations(this.currentTableEvent);
    }
  }

  // onCheckboxChange(event: Event, fieldName: string) {
  //   const checkbox = event.target as HTMLInputElement;
  //   const value = checkbox.value;

  //   if (!this.selectedCheckboxes[fieldName]) {
  //     this.selectedCheckboxes[fieldName] = [];
  //   }

  //   if (checkbox.checked) {
  //     this.selectedCheckboxes[fieldName].push(value);
  //   } else {
  //     const index = this.selectedCheckboxes[fieldName].indexOf(value);
  //     if (index > -1) {
  //       this.selectedCheckboxes[fieldName].splice(index, 1);
  //     }
  //   }

  //   console.log(this.selectedCheckboxes);
  // }
  statusChange(event: any): void {
    this.localStorageService.setItemOnLocalStorage(
      'selectedDepartmentStatus',
      event.value
    );
    this.loadDesignations(this.currentTableEvent);
  }

  applyConfigFilters(event) {
    let api_filter = event;
    if (api_filter['reset']) {
      delete api_filter['reset'];
      this.appliedFilter = {};
    } else {
      this.appliedFilter = api_filter;
    }
    this.localStorageService.setItemOnLocalStorage(
      'departmentsAppliedFilter',
      this.appliedFilter
    );
    this.loadDesignations(this.currentTableEvent);
  }
  filterWithCandidateName(): void {
    const searchFilter = { 'displayName-like': this.displayNameToSearch };
    this.applyFilters(searchFilter);
  }

  applyFilters(searchFilter = {}) {
    this.searchFilter = searchFilter;
    console.log(this.currentTableEvent);
    this.loadDesignations(this.currentTableEvent);
  }
  loadDesignations(event) {
    this.currentTableEvent = event;
    let api_filter = this.employeesService.setFiltersFromPrimeTable(event);
    api_filter = Object.assign(
      {},
      api_filter,
      this.searchFilter,
      this.appliedFilter
    );
    if (this.selectedDepartmentStatus) {
      if (this.selectedDepartmentStatus && this.selectedDepartmentStatus.name) {
        if (this.selectedDepartmentStatus.name != 'all') {
          api_filter['designationInternalStatus-eq'] =
            this.selectedDepartmentStatus.id;
        } else {
          api_filter['lastDesignationInternalStatus-or'] = '1,2';
        }
      }
    }
    if (api_filter) {
      this.getDesignationCount(api_filter);
      this.getDesignations(api_filter);
    }
  }

  getDesignationCount(filter = {}) {
    this.employeesService.getDesignationCount(filter).subscribe(
      (response) => {
        this.totalDesignationsCount = response;
      },
      (error: any) => {
        this.toastService.showError(error);
      }
    );
  }

  getDesignations(filter = {}) {
    this.apiLoading = true;
    this.employeesService.getDesignations(filter).subscribe(
      (response) => {
        this.designations = response;
        console.log('designations', this.designations);
        this.apiLoading = false;
      },
      (error: any) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      }
    );
  }

  // createDepartment(): void {
  //   this.actionType = 'create';
  //   this.heading = 'Create Department';
  //   this.isDialogVisible = true;
  //   this.departmentsForm.reset();
  // }

  // clearDialog(): void {
  //   this.isDialogVisible = false;
  //   this.departmentsForm.reset();
  // }

  // onSubmit(formValues) {
  //   const rbacValues = (
  //     this.departmentsForm.get('rbac') as FormArray
  //   ).value.map((group) => {
  //     return Object.keys(group).filter((key) => group[key]);
  //   });
  //   const rbacCombined = rbacValues.flat().join(',');
  //   const formData = {
  //     displayName: formValues.displayName,
  //     designation: formValues.designation,
  //     rbac: rbacCombined,
  //   };
  //   console.log('formData', formData);
  //   if (this.actionType == 'create') {
  //     this.loading = true;
  //     this.employeesService.createDesignation(formData).subscribe(
  //       (data) => {
  //         if (data) {
  //           this.loading = false;
  //           this.isDialogVisible = false;
  //           this.toastService.showSuccess('Department Added Successfully');
  //           this.routingService.handleRoute('designations', null);
  //           this.loadDesignations(this.currentTableEvent);
  //         }
  //       },
  //       (error: any) => {
  //         this.loading = false;
  //         console.log(error);
  //         this.toastService.showError(error);
  //       }
  //     );
  //   } else if (this.actionType == 'update') {
  //     this.loading = true;
  //     console.log(formData);
  //     this.employeesService
  //       .updateDesignation(this.designationId, formData)
  //       .subscribe(
  //         (data) => {
  //           if (data) {
  //             this.loading = false;
  //             this.isDialogVisible = false;
  //             this.toastService.showSuccess('Department Updated Successfully');
  //             this.routingService.handleRoute('designations', null);
  //             this.loadDesignations(this.currentTableEvent);
  //           }
  //         },
  //         (error: any) => {
  //           this.loading = false;
  //           this.toastService.showError(error);
  //         }
  //       );
  //   }
  // }

  getStatusColor(status: string): {
    textColor: string;
    backgroundColor: string;
  } {
    switch (status) {
      case 'Active':
        return { textColor: '#5DCC0B', backgroundColor: '#E4F7D6' };
      case 'InActive':
        return { textColor: '#FF555A', backgroundColor: '#FFE2E3' };
      default:
        return { textColor: 'black', backgroundColor: 'white' };
    }
  }

  // updateDepartment(department) {
  //   this.isDialogVisible = true;
  //   if (department && department?.designationId) {
  //     this.designationId = department.designationId;
  //     this.actionType = 'update';
  //     this.heading = 'Update Department';
  //     console.log(this.designationId);
  //     this.getDesignationsById().then((data) => {
  //       if (data) {
  //         this.departmentsForm.patchValue({
  //           designation: this.departmentData?.designation,
  //           displayName: this.departmentData?.displayName,
  //         });
  //       }
  //     });
  //   }
  // }
  // updateDepartment(department) {
  //   this.isDialogVisible = true;
  //   if (department && department?.designationId) {
  //     this.designationId = department.designationId;
  //     this.actionType = 'update';
  //     this.heading = 'Update Department';
  //     console.log(this.designationId);

  //     this.getDesignationsById().then((data) => {
  //       if (data) {
  //         console.log(this.departmentData);
  //         this.departmentsForm.patchValue({
  //           designation: this.departmentData?.designation,
  //           displayName: this.departmentData?.displayName,
  //         });
  //         // this.patchRbacValues(this.departmentData.rbac);
  //       }
  //     });
  //   }
  // }
  // patchRbacValues(rbacValues: string) {
  //   const rbacArray = rbacValues.split(',');
  //   const rbacFormArray = this.departmentsForm.get('rbac') as FormArray;
  //   this.modules.forEach((module, moduleIndex) => {
  //     const group = rbacFormArray.at(moduleIndex) as FormGroup;
  //     if (module.type === 'radio') {
  //       module.options.forEach((option) => {
  //         // If the radio option is in the rbacArray, set the corresponding control to true
  //         const isSelected = rbacArray.includes(option.value);
  //         group.get(option.value)?.setValue(isSelected);
  //       });
  //     }
  //     if (module.type === 'checkbox') {
  //       // For checkboxes, check or uncheck based on the rbacValues
  //       module.options.forEach((option) => {
  //         const isChecked = rbacArray.includes(option.value);
  //         group.get(option.value)?.setValue(isChecked);
  //       });
  //     }
  //   });
  // }

  // patchRbacValues(rbacValues: string) {
  //   const rbacArray = rbacValues.split(',');

  //   const rbacFormArray = this.departmentsForm.get('rbac') as FormArray;

  //   this.modules.forEach((module, moduleIndex) => {
  //     const group = rbacFormArray.at(moduleIndex) as FormGroup;

  //     // Handle radio buttons
  //     if (module.type === 'radio') {
  //       // Reset the radio button group (make all radio buttons false)
  //       group.get(module.name)?.setValue(null); // This clears the radio group selection

  //       // Find and set the selected radio option
  //       const selectedOption = module.options.find((option) =>
  //         rbacArray.includes(option.value)
  //       );

  //       if (selectedOption) {
  //         group.get(module.name)?.setValue(selectedOption.value); // Set the selected option
  //       }
  //     }

  //     // Handle checkboxes
  //     if (module.type === 'checkbox') {
  //       module.options.forEach((option) => {
  //         const isChecked = rbacArray.includes(option.value);
  //         group.get(option.value)?.setValue(isChecked); // Set checkbox state
  //       });
  //     }
  //   });
  // }

  // patchRbacValues(rbacValues: string) {
  //   const rbacArray = rbacValues.split(',');

  //   const rbacFormArray = this.departmentsForm.get('rbac') as FormArray;

  //   this.modules.forEach((module, moduleIndex) => {
  //     const group = rbacFormArray.at(moduleIndex) as FormGroup;

  //     // Handle radio buttons
  //     if (module.type === 'radio') {
  //       // Find the selected radio option
  //       const selectedOption = module.options.find((option) =>
  //         rbacArray.includes(option.value)
  //       );
  //       if (selectedOption) {
  //         group.get(module.name)?.setValue(selectedOption.value); // Patch the value to the control
  //       }
  //     }
  //     if (module.type === 'checkbox') {
  //       module.options.forEach((option) => {
  //         const isChecked = rbacArray.includes(option.value);
  //         group.get(option.value)?.setValue(isChecked); // Patch checkbox state
  //       });
  //     }
  //   });
  // }

  // getDesignationsById(filter = {}) {
  //   return new Promise((resolve, reject) => {
  //     this.loading = true;
  //     this.employeesService
  //       .getDesignationsById(this.designationId, filter)
  //       .subscribe(
  //         (response) => {
  //           this.departmentData = response;
  //           this.loading = false;
  //           resolve(true);
  //         },
  //         (error: any) => {
  //           this.loading = false;
  //           resolve(false);
  //           this.toastService.showError(error);
  //         }
  //       );
  //   });
  // }

  actionItems(department: any): MenuItem[] {
    const menuItems: any = [{ label: 'Actions', items: [] }];
    if (department.designationInternalStatus === 1) {
      menuItems[0].items.push({
        label: 'In Active',
        icon: 'fa fa-right-to-bracket',
        command: () => this.inactiveDepartment(department),
      });
      menuItems[0].items.push({
        label: 'Update',
        icon: 'fa fa-pen-to-square',
        command: () => this.updateDepartment(department.designationId),
      });
      if (this.capabilities.delete) {
        menuItems[0].items.push({
          label: 'Delete',
          icon: 'fa fa-trash',
          command: () => this.confirmDelete(department),
        });
      }
    } else if (department.designationInternalStatus === 2) {
      menuItems[0].items.push({
        label: 'In Active',
        icon: 'fa fa-right-to-bracket',
        command: () => this.ActiveDepartment(department),
      });
    }
    return menuItems;
  }

  createDepartment() {
    this.routingService.handleRoute('designations/create', null);
  }
  updateDepartment(designationId) {
    this.routingService.handleRoute(
      'designations/update/' + designationId,
      null
    );
  }
  ActiveDepartment(department) {
    this.changeDesignationStatus(department.designationId, 1);
  }
  inactiveDepartment(department) {
    this.changeDesignationStatus(department.designationId, 2);
  }
  changeDesignationStatus(designationId, statusId) {
    this.loading = true;
    this.employeesService
      .changeDesignationStatus(designationId, statusId)
      .subscribe(
        (response) => {
          this.toastService.showSuccess(
            'Departments Status Changed Successfully'
          );
          this.loading = false;
          this.loadDesignations(this.currentTableEvent);
        },
        (error: any) => {
          this.loading = false;
          this.toastService.showError(error);
        }
      );
  }
  confirmDelete(department) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this Department ? <br>
              Department Name: ${department.displayName}<br>
              Department ID: ${department.designationId}
              `,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteDepartment(department.designationId);
      },
    });
  }

  deleteDepartment(designationId) {
    this.loading = true;
    this.employeesService.deleteDesignation(designationId).subscribe(
      (response: any) => {
        console.log(response);
        this.toastService.showSuccess(response?.message);
        this.loading = false;
        this.loadDesignations(this.currentTableEvent);
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  getStatusName(statusId) {
    if (
      this.departmentInternalStatusList &&
      this.departmentInternalStatusList.length > 0
    ) {
      let departmentStatusName = this.departmentInternalStatusList.filter(
        (departmentStatus) => departmentStatus.id == statusId
      );
      return (
        (departmentStatusName &&
          departmentStatusName[0] &&
          departmentStatusName[0].name) ||
        ''
      );
    }
    return '';
  }
  goBack() {
    this.location.back();
  }
}
