import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EmployeesService } from '../employees.service';
import { ToastService } from 'src/app/services/toast.service';
import { RoutingService } from 'src/app/services/routing-service';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { FileUploadComponent } from '../../file-upload/file-upload.component';
import { DialogService } from 'primeng/dynamicdialog';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  breadCrumbItems: any = [];
  loading: boolean = false;
  showDialog: boolean = false;
  employees: any = null;
  offerLetterHtml: string = '';
  attendance: any = [];
  salaryHikes: any = [];
  totalLeavesCount: any = 0;
  leaves: any = [];
  currentTableEvent: any;
  selectedDate: Date;
  displayMonth: Date;
  payroll: any = [];
  totalPayrollCount: any = 0;
  resignationformFields: any = [];
  totalIncentivesCount: any = 0;
  incentives: any = [];
  terminationFormFields: any = [];
  moment: any;
  issuedPayslips: any = projectConstantsLocal.ISSUED_PAYSLIPS;
  version = projectConstantsLocal.VERSION_DESKTOP;
  leavesInternalStatusList: any = projectConstantsLocal.LEAVE_STATUS;
  employeeId: string | null = null;
  activeSection: string = 'employeeDetails';
  employeeInternalStatusList: any = projectConstantsLocal.EMPLOYEE_STATUS;
  month: any;
  apiLoading: any;
  year: any;
  selectedFiles: any = {
    resignationLetter: { filesData: [], links: [], uploadedFiles: [] },
    experienceLetter: { filesData: [], links: [], uploadedFiles: [] },
    terminationLetter: { filesData: [], links: [], uploadedFiles: [] },
  };
  sections = [
    { id: 'employeeDetails', label: 'Employee Details' },
    { id: 'personalDetails', label: 'Personal Details' },
    { id: 'experienceDetails', label: 'Experience Details' },
    { id: 'kycDetails', label: 'KYC Details' },
    { id: 'accountDetails', label: 'Account Details' },
    { id: 'attendanceDetails', label: 'Attendance Details' },
    { id: 'payrollDetails', label: 'Payroll Details' },
    { id: 'incentiveDetails', label: 'Incentive Details' },
    { id: 'leaves', label: 'Leaves' },
    { id: 'otherDetails', label: 'Other Details' },
  ];
  attendanceStatusCounts: { [key: string]: number } = {
    Present: 0,
    Absent: 0,
    Late: 0,
    'Half-day': 0,
  };
  capabilities: any;
  resignationForm: UntypedFormGroup;
  terminationForm: UntypedFormGroup;
  currentYear: number;
  userType: any;
  constructor(
    private location: Location,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private formBuilder: UntypedFormBuilder,
    private localStorageService: LocalStorageService,
    private routingService: RoutingService,
    private employeesService: EmployeesService,
    private dialogService: DialogService,
    private dateTimeProcessor: DateTimeProcessorService
  ) {
    this.moment = this.dateTimeProcessor.getMoment();
    this.selectedDate = this.moment(new Date()).toDate();
    console.log(this.selectedDate);
    this.month = this.selectedDate.getMonth() + 1;
    this.year = this.selectedDate.getFullYear();
    this.selectedDate = this.moment(new Date()).format('YYYY-MM');
    this.displayMonth = this.moment(new Date()).format('MMMM YYYY');
    this.capabilities = this.employeesService.getUserRbac();
    console.log('capabilities', this.capabilities);
    this.userType = localStorageService.getItemFromLocalStorage('userType');
    this.breadCrumbItems = [
      {
        icon: 'fa fa-house',
        label: ' Dashboard',
        routerLink: `/${this.userType}/dashboard`,
        queryParams: { v: this.version },
      },
      ...(!this.capabilities.employee
        ? [
            {
              label: 'Employees',
              routerLink: `/${this.userType}/employees`,
              queryParams: { v: this.version },
            },
          ]
        : []),
      { label: 'Profile' },
    ];
  }
  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.getEmployeeById(this.employeeId).then((data) => {
        if (data) {
          console.log('Employee Data', this.employees);
          this.resignationForm.patchValue({
            resignedDate: this.employees?.resignedDate,
            resignedReason: this.employees?.resignedReason,
            issuedPayslips: this.employees?.issuedPayslips,
            anyDues: this.employees?.anyDues,
          });
          this.terminationForm.patchValue({
            terminationDate: this.employees?.terminationDate,
            terminationReason: this.employees?.terminationReason,
            anyDues: this.employees?.anyDues,
          });
          if (this.employees.resignationLetter) {
            this.selectedFiles['resignationLetter']['uploadedFiles'] =
              this.employees.resignationLetter;
          }
          if (this.employees.experienceLetter) {
            this.selectedFiles['experienceLetter']['uploadedFiles'] =
              this.employees.experienceLetter;
          }
          if (this.employees.terminationLetter) {
            this.selectedFiles['terminationLetter']['uploadedFiles'] =
              this.employees.terminationLetter;
          }
          console.log(this.selectedFiles);
        }
      });
      this.getAttendance();
    }
    this.createForm();
    this.setHolidaysList();
  }
  onDialogHide() {
    this.showDialog = false;
  }
  roundToLPA(amount: number): string {
    const lakhs = amount / 100000;
    return lakhs.toFixed(2) + ' LPA';
  }
  setHolidaysList() {
    this.resignationformFields = [
      {
        label: 'Date',
        controlName: 'resignedDate',
        type: 'calendar',
        required: true,
      },
      {
        label: 'Reason',
        controlName: 'resignedReason',
        type: 'textarea',
        required: true,
      },
      {
        label: 'Resignation Letter',
        controlName: 'resignationLetter',
        type: 'file',
        required: false,
        uploadFunction: 'uploadFiles',
        acceptedFileTypes: '*/*',
      },
      {
        label: 'Experience Letter',
        controlName: 'experienceLetter',
        type: 'file',
        required: false,
        uploadFunction: 'uploadFiles',
        acceptedFileTypes: '*/*',
      },
      {
        label: 'Issued Payslips',
        controlName: 'issuedPayslips',
        type: 'dropdown',
        options: 'issuedPayslips',
        required: true,
        optionLabel: 'label',
        optionValue: 'value',
      },
      {
        label: 'Dues',
        controlName: 'anyDues',
        type: 'text',
        required: true,
      },
    ];
    this.terminationFormFields = [
      {
        label: 'Date',
        controlName: 'terminationDate',
        type: 'calendar',
        required: true,
      },
      {
        label: 'Reason',
        controlName: 'terminationReason',
        type: 'textarea',
        required: true,
      },
      {
        label: 'Termination Letter',
        controlName: 'terminationLetter',
        type: 'file',
        required: false,
        uploadFunction: 'uploadFiles',
        acceptedFileTypes: '*/*',
      },
      {
        label: 'Dues',
        controlName: 'anyDues',
        type: 'text',
        required: true,
      },
    ];
  }
  createForm() {
    this.resignationForm = this.formBuilder.group({
      resignedDate: ['', Validators.compose([Validators.required])],
      resignedReason: ['', Validators.compose([Validators.required])],
      issuedPayslips: ['', Validators.compose([Validators.required])],
      anyDues: ['', Validators.compose([Validators.required])],
    });
    this.terminationForm = this.formBuilder.group({
      terminationDate: ['', Validators.compose([Validators.required])],
      terminationReason: ['', Validators.compose([Validators.required])],
      anyDues: ['', Validators.compose([Validators.required])],
    });
  }
  // sendEmail(employees) {
  //   this.loading = true;
  //   const emailData = {
  //     subject: 'Termination Letter',
  //     body: employees?.terminationReason,
  //     employeeName: employees.employeeName,
  //     email: employees.emailAddress,
  //   };
  //   this.employeesService.sendTerminationmail(emailData).subscribe(
  //     (data) => {
  //       if (data) {
  //         this.loading = false;
  //         this.toastService.showSuccess('Termination Mail Send Successfully');
  //       }
  //     },
  //     (error: any) => {
  //       this.loading = false;
  //       this.toastService.showError(error);
  //     }
  //   );
  // }
  onSubmit(formValues) {
    console.log(formValues);
    let formData: any = {
      employeeName: this.employees.employeeName,
      resignedDate: formValues?.resignedDate
        ? this.moment(formValues?.resignedDate).format('YYYY-MM-DD')
        : null,
      resignedReason: formValues?.resignedReason,
      terminationDate: formValues?.terminationDate
        ? this.moment(formValues?.terminationDate).format('YYYY-MM-DD')
        : null,
      terminationReason: formValues?.terminationReason,
      issuedPayslips: formValues?.issuedPayslips,
      anyDues: formValues?.anyDues,
      resignationLetter: this.getFileData('resignationLetter'),
      experienceLetter: this.getFileData('experienceLetter'),
      terminationLetter: this.getFileData('terminationLetter'),
    };
    console.log('formData', formData);
    this.loading = true;
    this.employeesService.updateEmployee(this.employeeId, formData).subscribe(
      (data) => {
        if (data) {
          this.loading = false;
          this.toastService.showSuccess(
            'Resignation Details Added Successfully'
          );
          this.changeEmployeeStatus(this.employeeId, 2);
        }
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  private getFileData(fileType: string): any[] | null {
    if (this.selectedFiles[fileType]) {
      const { links = [], uploadedFiles = [] } = this.selectedFiles[fileType];
      if (links.length > 0 || uploadedFiles.length > 0) {
        return [...links, ...uploadedFiles];
      }
    }
    return null;
  }
  getStatusName(statusId) {
    if (
      this.employeeInternalStatusList &&
      this.employeeInternalStatusList.length > 0
    ) {
      let employeeStatusName = this.employeeInternalStatusList.filter(
        (employeeStatus) => employeeStatus.id == statusId
      );
      return (
        (employeeStatusName &&
          employeeStatusName[0] &&
          employeeStatusName[0].name) ||
        ''
      );
    }
    return '';
  }
  changeEmployeeStatus(employeeId, statusId) {
    this.loading = true;
    this.employeesService.changeEmployeeStatus(employeeId, statusId).subscribe(
      (response) => {
        this.toastService.showSuccess('Employee Status Changed Successfully');
        this.loading = false;
        this.routingService.handleRoute('employees', null);
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  onDateChange(event: any) {
    const selectedDate = this.moment(event).toDate();
    this.displayMonth = this.moment(event).format('MMMM YYYY');
    this.month = selectedDate.getMonth() + 1;
    this.year = selectedDate.getFullYear();
    this.getAttendance();
  }
  getAttendance() {
    this.loading = true;
    this.employeesService.getAttendance().subscribe(
      (response) => {
        this.attendance = response;
        this.loading = false;
        this.getAttendanceCountsByMonth(
          this.attendance,
          this.month,
          this.year,
          this.employeeId
        );
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  getAttendanceCountsByMonth(attendanceRecords, month, year, employeeId) {
    this.attendanceStatusCounts = {
      Present: 0,
      Absent: 0,
      Late: 0,
      'Half-day': 0,
    };
    attendanceRecords.forEach((record) => {
      const attendanceDate = new Date(record.attendanceDate);
      const recordMonth = attendanceDate.getMonth() + 1;
      const recordYear = attendanceDate.getFullYear();
      if (recordMonth === month && recordYear === year) {
        const employeeAttendance = record?.attendanceData.find(
          (data) => data.employeeId == employeeId
        );
        if (
          employeeAttendance &&
          this.attendanceStatusCounts[employeeAttendance.status] !== undefined
        ) {
          this.attendanceStatusCounts[employeeAttendance.status]++;
        }
      }
    });
    console.log('Attendance Status Counts:', this.attendanceStatusCounts);
  }
  selectSection(section: string) {
    this.activeSection = section;
  }
  updateEmployee(employeeId) {
    this.routingService.handleRoute('employees/update/' + employeeId, null);
  }
  isImageFile(file: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = file.split('.').pop()?.toLowerCase();
    return !!fileExtension && imageExtensions.includes(fileExtension);
  }
  getFileIcon(fileType) {
    return this.employeesService.getFileIcon(fileType);
  }
  getEmployeeById(id) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.employeesService.getEmployeeById(id).subscribe(
        (employees: any) => {
          const filter = {  'hikeInternalStatus-eq': 1 };
          this.getSalaryHikes(filter).subscribe(
            (salaryHikeData: any) => {
              if (salaryHikeData) {
                const matchingHikes = salaryHikeData.filter(
                  (hike) => hike.employeeId == id
                );
                if (matchingHikes.length > 0) {
                  let totalSalary = employees.salary;
                  employees.salaryHikes = matchingHikes.map((hike) => {
                    totalSalary += hike.monthlyHike;
                    return {
                      hikeDate: hike.hikeDate,
                      monthlyHike: hike.monthlyHike,
                    };
                  });
                  employees.totalSalary = totalSalary;
                }
              }
              this.employees = employees;
              this.loading = false;
              resolve(true);
            },
            (error) => {
              this.loading = false;
              this.toastService.showError(error);
              resolve(false);
            }
          );
        },
        (error) => {
          this.loading = false;
          this.toastService.showError(error);
          resolve(false);
        }
      );
    });
  }
  getSalaryHikes(filter) {
    return this.employeesService.getSalaryHikes(filter);
  }
  loadPayslips(event) {
    this.currentTableEvent = event;
    let api_filter = this.employeesService.setFiltersFromPrimeTable(event);
    api_filter['employeeId-eq'] = this.employeeId;
    api_filter = Object.assign({}, api_filter);
    console.log(api_filter);
    if (api_filter) {
      this.getPayrollCount(api_filter);
      this.getPayroll(api_filter);
    }
  }

  getPayrollCount(filter = {}) {
    this.employeesService.getPayrollCount(filter).subscribe(
      (response) => {
        this.totalPayrollCount = response;
      },
      (error: any) => {
        this.toastService.showError(error);
      }
    );
  }

  getPayroll(filter = {}) {
    this.apiLoading = true;
    this.employeesService.getPayroll(filter).subscribe(
      (payrollResponse: any) => {
        this.payroll = payrollResponse;
        console.log('Payroll Data:', this.payroll);
        this.apiLoading = false;
      },
      (error: any) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      }
    );
  }

  loadLeaves(event) {
    this.currentTableEvent = event;
    let api_filter = this.employeesService.setFiltersFromPrimeTable(event);
    api_filter['employeeId-eq'] = this.employeeId;
    api_filter = Object.assign({}, api_filter);
    console.log(api_filter);
    if (api_filter) {
      this.getLeavesCount(api_filter);
      this.getLeaves(api_filter);
    }
  }

  getLeavesCount(filter = {}) {
    this.employeesService.getLeavesCount(filter).subscribe(
      (response) => {
        this.totalLeavesCount = response;
      },
      (error: any) => {
        this.toastService.showError(error);
      }
    );
  }

  getLeaves(filter = {}) {
    this.apiLoading = true;
    this.employeesService.getLeaves(filter).subscribe(
      (response) => {
        this.leaves = response;
        console.log('leaves', this.leaves);
        this.apiLoading = false;
      },
      (error: any) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      }
    );
  }

  getLeavesStatusColor(status: string): {
    textColor: string;
    backgroundColor: string;
  } {
    switch (status) {
      case 'approved':
        return { textColor: '#5DCC0B', backgroundColor: '#E4F7D6' };
      case 'pending':
        return { textColor: '#FFBA15', backgroundColor: '#FFF3D6' };
      case 'rejected':
        return { textColor: '#FF555A', backgroundColor: '#FFE2E3' };
      default:
        return { textColor: 'black', backgroundColor: 'white' };
    }
  }
  getLeavesStatusName(statusId) {
    if (
      this.leavesInternalStatusList &&
      this.leavesInternalStatusList.length > 0
    ) {
      let leaveStatusName = this.leavesInternalStatusList.filter(
        (leaveStatus) => leaveStatus.id == statusId
      );
      return (
        (leaveStatusName && leaveStatusName[0] && leaveStatusName[0].name) || ''
      );
    }
    return '';
  }

  ViewPayslip(payslipId) {
    this.routingService.handleRoute('payroll/payslip/' + payslipId, null);
  }

  loadIncentives(event) {
    this.currentTableEvent = event;
    let api_filter = this.employeesService.setFiltersFromPrimeTable(event);
    api_filter = Object.assign({}, api_filter);
    api_filter['employeeId-eq'] = this.employeeId;
    if (api_filter) {
      this.getIncentivesCount(api_filter);
      this.getIncentives(api_filter);
    }
  }

  getIncentivesCount(filter = {}) {
    this.employeesService.getIncentivesCount(filter).subscribe(
      (response) => {
        this.totalIncentivesCount = response;
      },
      (error: any) => {
        this.toastService.showError(error);
      }
    );
  }
  getIncentives(filter = {}) {
    this.apiLoading = true;
    this.employeesService.getIncentives(filter).subscribe(
      (response) => {
        this.incentives = response;
        console.log('incentives', this.incentives);
        this.apiLoading = false;
      },
      (error: any) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      }
    );
  }

  uploadFiles(fileType, acceptableTypes, index?) {
    console.log(acceptableTypes);
    let data = {
      acceptableTypes: acceptableTypes,
      files:
        index || index == 0
          ? this.selectedFiles[fileType][index]['filesData']
          : this.selectedFiles[fileType]['filesData'],
      uploadedFiles:
        index || index == 0
          ? this.selectedFiles[fileType][index]['uploadedFiles']
          : this.selectedFiles[fileType]['uploadedFiles'],
    };
    console.log(data);
    let fileUploadRef = this.dialogService.open(FileUploadComponent, {
      header: 'Select Files',
      width: '90%',
      contentStyle: { 'max-height': '500px', overflow: 'auto' },
      baseZIndex: 10000,
      data: data,
    });
    fileUploadRef.onClose.subscribe((files: any) => {
      if (files) {
        this.saveFiles(files, fileType, index);
      }
    });
  }
  saveFiles(files, fileType, index) {
    this.loading = true;
    if (files && files.length > 0) {
      console.log(files);
      const formData = new FormData();
      for (let file of files) {
        if (file && !file['fileuploaded']) {
          formData.append('files', file);
        }
      }
      console.log(formData);
      console.log(this.employeeId);
      console.log(fileType);
      this.employeesService
        .uploadFiles(formData, this.employeeId, fileType)
        .subscribe(
          (response: any) => {
            console.log(response);
            if (response && response['links'] && response['links'].length > 0) {
              for (let i = 0; i < response['links'].length; i++) {
                index || index == 0
                  ? this.selectedFiles[fileType][index]['links'].push(
                      response['links'][i]
                    )
                  : this.selectedFiles[fileType]['links'].push(
                      response['links'][i]
                    );
              }
              for (let i = 0; i < files.length; i++) {
                files[i]['fileuploaded'] = true;
                index || index == 0
                  ? this.selectedFiles[fileType][index]['filesData'].push(
                      files[i]
                    )
                  : this.selectedFiles[fileType]['filesData'].push(files[i]);
              }
              console.log(
                'this.selectedFiles',
                this.selectedFiles[fileType],
                files
              );
              this.toastService.showSuccess('Files Uploaded Successfully');
            } else {
              this.toastService.showError({ error: 'Something went wrong' });
            }
            this.loading = false;
          },
          (error: any) => {
            this.loading = false;
            this.toastService.showError(error);
          }
        );
    }
  }
  confirmDelete(file, controlName, docIndex?, fileIndex?) {
    console.log('Before Deletion:', this.selectedFiles);
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this File?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteFile(file, controlName, docIndex, fileIndex);
      },
    });
  }
  deleteFile(
    fileUrl: string,
    fileType: string,
    docIndex?: number,
    fileIndex?: number
  ) {
    const relativePath = fileUrl.substring(fileUrl.indexOf('/documents'));
    this.employeesService.deleteFile(relativePath).subscribe(
      (response: any) => {
        if (response.message === 'File deleted successfully.') {
          console.log('File deleted successfully.');
          if (this.selectedFiles[fileType]?.uploadedFiles) {
            this.selectedFiles[fileType].uploadedFiles = this.selectedFiles[
              fileType
            ].uploadedFiles.filter((f: string) => f !== fileUrl);
            console.log('After Deletion:', this.selectedFiles);
          } else if (Array.isArray(this.selectedFiles[fileType])) {
            if (docIndex !== undefined && fileIndex !== undefined) {
              const document = this.selectedFiles[fileType][docIndex];
              if (Array.isArray(document?.uploadedFiles)) {
                document.uploadedFiles.splice(fileIndex, 1);
                console.log(
                  `After Deletion from ${fileType}[${docIndex}]:`,
                  document.uploadedFiles
                );
              }
              console.log('After Deletion:', this.selectedFiles);
            } else {
              console.error('docIndex or fileIndex is missing.');
            }
          } else {
            console.error(
              'No uploaded files found for the specified file type.'
            );
          }
          this.toastService.showSuccess('File Deleted Successfully');
        } else {
          console.error('Error deleting file:', response.error);
          this.toastService.showError(response);
        }
      },
      (error) => {
        console.error('Error deleting file:', error);
        this.toastService.showError(
          'Failed to delete file. Please try again later.'
        );
      }
    );
  }
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
  goBack() {
    this.location.back();
  }
}
