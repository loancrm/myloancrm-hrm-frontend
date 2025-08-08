import { Component } from '@angular/core';
import { Location } from '@angular/common';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
import { EmployeesService } from '../employees.service';
import { ToastService } from 'src/app/services/toast.service';
import { RoutingService } from 'src/app/services/routing-service';
import { ActivatedRoute } from '@angular/router';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { DialogService } from 'primeng/dynamicdialog';
import { FileUploadComponent } from '../../file-upload/file-upload.component';
import { ConfirmationService } from 'primeng/api';
import { LocalStorageService } from 'src/app/services/local-storage.service';
@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent {
  personalFields: any = [];
  experienceFields: any = [];
  addressFields: any = [];
  kycFields: any = [];
  otherFields: any = [];
  salaryAccountFields: any = [];
  breadCrumbItems: any = [];
  employeeData: any;
  steps: any[];
  moment: any;
  employeeId: any;
  employeeForm: UntypedFormGroup;
  activeIndex: number = 0;
  heading: any = 'Create Employee';
  actionType: any = 'create';
  version = projectConstantsLocal.VERSION_DESKTOP;
  ofcBranchNamesList: any = projectConstantsLocal.BRANCH_ENTITIES;
  branchEntities: any = projectConstantsLocal.BRANCH_ENTITIES;
  careOfEntities: any = projectConstantsLocal.CARE_OF_ENTITIES;
  qualificationEntities: any = projectConstantsLocal.QUALIFICATION_ENTITIES;
  genderEntities: any = projectConstantsLocal.GENDER_ENTITIES;
  // designationEntities: any = projectConstantsLocal.DEPARTMENT_ENTITIES;
  designationEntities: any;

  loading: any;
  selectedFiles: any = {
    panCard: { filesData: [], links: [], uploadedFiles: [] },
    offerLetter: { filesData: [], links: [], uploadedFiles: [] },
    aadharCard: { filesData: [], links: [], uploadedFiles: [] },
    passPhoto: { filesData: [], links: [], uploadedFiles: [] },
    otherDocuments: [{ filesData: [], links: [], uploadedFiles: [] }],
  };
  capabilities: any;
  otherDocuments: any = [
    {
      name: '',
      otherDocuments: [],
    },
  ];
  currentYear: number;
  constructor(
    private location: Location,
    private confirmationService: ConfirmationService,
    private formBuilder: UntypedFormBuilder,
    private toastService: ToastService,
    private employeesService: EmployeesService,
    private routingService: RoutingService,
    private localStorageService: LocalStorageService,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dateTimeProcessor: DateTimeProcessorService
  ) {
    this.steps = [
      { label: 'Employee Details', icon: 'fa fa-user' },
      { label: 'Employee Address', icon: 'fa fa-location-dot' },
      { label: 'Experience Details', icon: 'fa fa-briefcase' },
      { label: 'Kyc Details', icon: 'fa fa-address-card' },
      { label: 'Account Details', icon: 'fa fa-money-bill' },
      { label: 'Other Details', icon: 'fa fa-folder-open' },
    ];
    this.getDesignations();
    this.moment = this.dateTimeProcessor.getMoment();
    this.activatedRoute.params.subscribe((params) => {
      if (params && params['id']) {
        this.employeeId = params['id'];
        this.actionType = 'update';
        this.heading = 'Update Employee';
        this.getEmployeeById().then((data) => {
          if (data) {
            console.log('Employee Data', this.employeeData);
            this.employeeForm.patchValue({
              employeeName: this.employeeData?.employeeName,
              customEmployeeId: this.employeeData?.customEmployeeId,
              careOf: this.employeeData?.careOf,
              careOfName: this.employeeData?.careOfName,
              dateOfBirth: this.employeeData?.dateOfBirth,
              gender: this.employeeData?.gender,
              ofcBranch: this.employeeData?.ofcBranch,
              designation: this.employeeData?.designation,
              joiningDate: this.employeeData?.joiningDate,
              primaryPhone: this.employeeData?.primaryPhone,
              emailAddress: this.employeeData?.emailAddress,
              salary: this.employeeData?.salary,
              qualification: this.employeeData?.qualification,
              city: this.employeeData?.city,
              district: this.employeeData?.district,
              state: this.employeeData?.state,
              currentAddress: this.employeeData?.currentAddress,
              permanentAddress: this.employeeData?.permanentAddress,
              secondaryPhone: this.employeeData?.secondaryPhone,
              accountHolderName: this.employeeData?.accountHolderName,
              bankName: this.employeeData?.bankName,
              bankBranch: this.employeeData?.bankBranch,
              accountNumber: this.employeeData?.accountNumber,
              ifscCode: this.employeeData?.ifscCode,
              panNumber: this.employeeData?.panNumber,
              aadharNumber: this.employeeData?.aadharNumber,
              prevCompanyName: this.employeeData?.prevCompanyName,
              prevEmployerContact: this.employeeData?.prevEmployerContact,
              prevEmployerName: this.employeeData?.prevEmployerName,
              experience: this.employeeData?.experience,
            });
            if (this.employeeData.panCard) {
              this.selectedFiles['panCard']['uploadedFiles'] =
                this.employeeData.panCard;
            }
            if (this.employeeData.offerLetter) {
              this.selectedFiles['offerLetter']['uploadedFiles'] =
                this.employeeData.offerLetter;
            }
            if (this.employeeData.aadharCard) {
              this.selectedFiles['aadharCard']['uploadedFiles'] =
                this.employeeData.aadharCard;
            }
            if (this.employeeData.passPhoto) {
              this.selectedFiles['passPhoto']['uploadedFiles'] =
                this.employeeData.passPhoto;
            }
            if (
              this.employeeData.otherDocuments &&
              this.employeeData.otherDocuments.length > 0
            ) {
              this.otherDocuments = [];
              this.selectedFiles['otherDocuments'] = [];
              this.employeeData.otherDocuments.forEach((statement, index) => {
                let fileData = {
                  filesData: [],
                  links: [],
                  uploadedFiles: statement['otherDocuments'],
                };
                this.selectedFiles['otherDocuments'].push(fileData);
                this.otherDocuments.push(statement);
              });
            }
            console.log(this.selectedFiles);
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
        label: 'Employees',
        routerLink: '/user/employees',
        queryParams: { v: this.version },
      },
      { label: this.actionType == 'create' ? 'Create' : 'Update' },
    ];
  }

  ngOnInit() {
    this.currentYear = this.employeesService.getCurrentYear();
    this.createForm();
    this.setEmployeesList();
    this.capabilities = this.employeesService.getUserRbac();
    console.log('capabilities', this.capabilities);
  }

  addotherDocumentsRow() {
    let data = {
      name: '',
      otherDocuments: [],
    };
    let fileData = { filesData: [], links: [], uploadedFiles: [] };
    this.otherDocuments.push(data);
    this.selectedFiles.otherDocuments.push(fileData);
  }

  deleteotherDocumentsRow(index) {
    this.otherDocuments.splice(index, 1);
    if (
      this.selectedFiles['otherDocuments'] &&
      this.selectedFiles['otherDocuments'][index]
    ) {
      this.selectedFiles['otherDocuments'].splice(index, 1);
    }
  }
  createForm() {
    this.employeeForm = this.formBuilder.group({
      employeeName: ['', Validators.compose([Validators.required])],
      customEmployeeId: ['', Validators.compose([Validators.required])],
      careOf: [''],
      careOfName: [''],
      dateOfBirth: ['', Validators.compose([Validators.required])],
      gender: ['', Validators.compose([Validators.required])],
      ofcBranch: ['', Validators.compose([Validators.required])],
      designation: ['', Validators.compose([Validators.required])],
      joiningDate: ['', Validators.compose([Validators.required])],
      primaryPhone: ['', Validators.compose([Validators.required])],
      emailAddress: [''],
      city: ['', Validators.compose([Validators.required])],
      salary: ['', Validators.compose([Validators.required])],
      secondaryPhone: [''],
      qualification: [''],
      district: [''],
      state: [''],
      permanentAddress: [''],
      currentAddress: [''],
      accountHolderName: [''],
      bankName: [''],
      bankBranch: [''],
      accountNumber: [''],
      ifscCode: [''],
      aadharNumber: [''],
      panNumber: [''],
      prevCompanyName: [''],
      prevEmployerName: [''],
      prevEmployerContact: [''],
      experience: [''],
    });
  }
  onSubmit(formValues) {
    let formData: any = {
      employeeName: formValues.employeeName,
      customEmployeeId: formValues.customEmployeeId,
      careOf: formValues.careOf,
      careOfName: formValues.careOfName,
      dateOfBirth: formValues.dateOfBirth
        ? this.moment(formValues.dateOfBirth).format('YYYY-MM-DD')
        : null,
      gender: formValues.gender,
      genderName: this.getGenderName(formValues.gender),
      ofcBranch: formValues.ofcBranch,
      ofcBranchName: this.getOfcBranchName(formValues.ofcBranch),
      designation: formValues.designation,
      designationName: this.getDesignationName(formValues.designation),
      joiningDate: formValues.joiningDate
        ? this.moment(formValues.joiningDate).format('YYYY-MM-DD')
        : null,
      panNumber: formValues.panNumber,
      aadharNumber: formValues.aadharNumber,
      currentAddress: formValues.currentAddress,
      permanentAddress: formValues.permanentAddress,
      primaryPhone: formValues.primaryPhone,
      secondaryPhone: formValues.secondaryPhone,
      emailAddress: formValues.emailAddress,
      salary: formValues.salary,
      qualification: formValues.qualification,
      city: formValues.city,
      district: formValues.district,
      state: formValues.state,
      experience: formValues.experience,
      prevCompanyName: formValues.prevCompanyName,
      prevEmployerName: formValues.prevEmployerName,
      prevEmployerContact: formValues.prevEmployerContact,
      accountHolderName: formValues.accountHolderName,
      bankName: formValues.bankName,
      bankBranch: formValues.bankBranch,
      ifscCode: formValues.ifscCode,
      accountNumber: formValues.accountNumber,
      panCard: this.getFileData('panCard'),
      offerLetter: this.getFileData('offerLetter'),
      aadharCard: this.getFileData('aadharCard'),
      passPhoto: this.getFileData('passPhoto'),
      otherDocuments: this.getOtherDocumentsData(),
    };

    console.log(this.otherDocuments);
    console.log('formData', formData);

    this.loading = true;
    if (this.actionType === 'create') {
      this.employeesService.createEmployee(formData).subscribe(
        (data) => {
          if (data) {
            this.loading = false;
            this.toastService.showSuccess('Employee Added Successfully');
            this.routingService.handleRoute('employees', null);
          }
        },
        (error: any) => {
          this.loading = false;
          console.log(error);
          this.toastService.showError(error);
        }
      );
    } else if (this.actionType === 'update') {
      this.employeesService.updateEmployee(this.employeeId, formData).subscribe(
        (data) => {
          if (data) {
            this.loading = false;
            this.toastService.showSuccess('Employee Updated Successfully');
            this.routingService.handleRoute('employees', null);
          }
        },
        (error: any) => {
          this.loading = false;
          this.toastService.showError(error);
        }
      );
    }
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

  private getOtherDocumentsData(): any[] | null {
    const otherDocumentsData = this.otherDocuments.map((document, index) => {
      const otherDocumentData: any = { ...document, otherDocuments: [] };
      if (this.selectedFiles['otherDocuments'][index]) {
        const { links = [], uploadedFiles = [] } =
          this.selectedFiles['otherDocuments'][index];
        if (links.length > 0 || uploadedFiles.length > 0) {
          otherDocumentData['otherDocuments'] = [...links, ...uploadedFiles];
        }
      }
      return otherDocumentData;
    });
    const filteredDocuments = otherDocumentsData.filter(
      (doc) => doc.otherDocuments.length > 0
    );
    return filteredDocuments.length > 0 ? filteredDocuments : null;
  }

  setEmployeesList() {
    this.personalFields = [
      {
        label: 'Custom Employee Id',
        controlName: 'customEmployeeId',
        type: 'text',
        required: true,
      },
      {
        label: 'Employee Name (as per Aadhaar)',
        controlName: 'employeeName',
        type: 'text',
        required: true,
      },
      {
        label: 'Department',
        controlName: 'designation',
        type: 'dropdown',
        options: 'designationEntities',
        required: true,
        optionLabel: 'displayName',
        optionValue: 'id',
      },
      {
        label: 'Office Branch',
        controlName: 'ofcBranch',
        type: 'dropdown',
        options: 'branchEntities',
        required: true,
        optionLabel: 'displayName',
        optionValue: 'id',
      },
      {
        label: 'Salary',
        controlName: 'salary',
        type: 'number',
        required: true,
      },
      {
        label: 'Joining Date',
        controlName: 'joiningDate',
        type: 'calendar',
        required: true,
      },

      {
        label: 'Date Of Birth',
        controlName: 'dateOfBirth',
        type: 'calendar',
        required: true,
      },
      {
        label: 'Primary Phone',
        controlName: 'primaryPhone',
        type: 'text',
        maxLength: 10,
        required: true,
      },
      {
        label: 'Secondary Phone',
        controlName: 'secondaryPhone',
        type: 'text',
        maxLength: 10,
        required: false,
      },
      {
        label: 'Qualification',
        controlName: 'qualification',
        type: 'dropdown',
        options: 'qualificationEntities',
        required: false,
        optionLabel: 'displayName',
        optionValue: 'name',
      },
      {
        label: 'Email Address',
        controlName: 'emailAddress',
        type: 'email',
      },
      {
        label: 'City',
        controlName: 'city',
        type: 'text',
        required: true,
      },
      {
        label: 'Gender',
        controlName: 'gender',
        type: 'dropdown',
        options: 'genderEntities',
        required: true,
        optionLabel: 'displayName',
        optionValue: 'id',
      },
      {
        label: 'Gaurdian Type',
        controlName: 'careOf',
        type: 'dropdown',
        options: 'careOfEntities',
        required: false,
        optionLabel: 'displayName',
        optionValue: 'name',
      },
      {
        label: 'Gaurdian Name',
        controlName: 'careOfName',
        type: 'text',
        required: false,
      },
    ];
    this.addressFields = [
      {
        label: 'District',
        controlName: 'district',
        type: 'text',
        required: false,
      },
      {
        label: 'State',
        controlName: 'state',
        type: 'text',
        required: false,
      },
      {
        label: 'Current Address',
        controlName: 'currentAddress',
        type: 'textarea',
        required: false,
      },
      {
        label: 'Permanent Address',
        controlName: 'permanentAddress',
        type: 'textarea',
        required: false,
      },
    ];
    this.experienceFields = [
      {
        label: 'Experience',
        controlName: 'experience',
        type: 'text',
        required: false,
      },
      {
        label: 'Previous Company Name',
        controlName: 'prevCompanyName',
        type: 'text',
        required: false,
      },
      {
        label: 'Previous Employer Name',
        controlName: 'prevEmployerName',
        type: 'text',
        required: false,
      },
      {
        label: 'Previous Employer Contact',
        controlName: 'prevEmployerContact',
        type: 'text',
        required: false,
        maxLength: 10,
      },
    ];
    this.kycFields = [
      {
        label: 'Employee Name',
        controlName: 'employeeName',
        type: 'text',
        required: true,
      },
      {
        label: 'Pan Number',
        controlName: 'panNumber',
        type: 'text',
        required: false,
        pattern: '[A-Z]{5}[0-9]{4}[A-Z]{1}',
        maxLength: 10,
      },
      {
        label: 'Aadhaar Number',
        controlName: 'aadharNumber',
        type: 'text',
        required: false,
        pattern: '[0-9]{12}',
        maxLength: 12,
      },
      {
        label: 'Employee Photo',
        controlName: 'passPhoto',
        type: 'file',
        required: false,
        uploadFunction: 'uploadFiles',
        acceptedFileTypes: 'image/*',
      },
      {
        label: 'Pan Card',
        controlName: 'panCard',
        type: 'file',
        required: false,
        uploadFunction: 'uploadFiles',
        acceptedFileTypes: '*/*',
      },
      {
        label: 'Aadhaar Card',
        controlName: 'aadharCard',
        type: 'file',
        required: false,
        uploadFunction: 'uploadFiles',
        acceptedFileTypes: '*/*',
      },
    ];
    this.salaryAccountFields = [
      {
        label: 'Account Holder Name',
        controlName: 'accountHolderName',
        type: 'text',
        required: false,
      },
      {
        label: 'Bank Name',
        controlName: 'bankName',
        type: 'text',
        required: false,
      },
      {
        label: 'Bank Branch',
        controlName: 'bankBranch',
        type: 'text',
        required: false,
      },
      {
        label: 'Account Number',
        controlName: 'accountNumber',
        type: 'text',
        required: false,
      },
      {
        label: 'IFSC Code',
        controlName: 'ifscCode',
        type: 'text',
        required: false,
      },
    ];
    this.otherFields = [
      {
        label: 'Offer Letter (signed)',
        controlName: 'offerLetter',
        type: 'file',
        required: false,
        uploadFunction: 'uploadFiles',
        acceptedFileTypes: '*/*',
      },
    ];
  }
  getOfcBranchName(branchId) {
    if (this.ofcBranchNamesList && this.ofcBranchNamesList.length > 0) {
      let branchName = this.ofcBranchNamesList.filter(
        (ofcBranch) => ofcBranch.id == branchId
      );
      return (branchName && branchName[0] && branchName[0].displayName) || '';
    }
    return '';
  }
  getDesignationName(designationId) {
    if (this.designationEntities && this.designationEntities.length > 0) {
      let designationName = this.designationEntities.filter(
        (designation) => designation.id == designationId
      );
      return (
        (designationName &&
          designationName[0] &&
          designationName[0].displayName) ||
        ''
      );
    }
    return '';
  }
  getGenderName(genderId) {
    if (this.genderEntities && this.genderEntities.length > 0) {
      let gernderName = this.genderEntities.filter(
        (gender) => gender.id == genderId
      );
      return (
        (gernderName && gernderName[0] && gernderName[0].displayName) || ''
      );
    }
    return '';
  }

  getDesignations(filter = {}) {
    this.loading = true;
    filter['designationInternalStatus-eq'] = 1;
    this.employeesService.getDesignations(filter).subscribe(
      (response: any) => {
        console.log(response);
        this.designationEntities = [...response];
        this.setEmployeesList();
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  getEmployeeById(filter = {}) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.employeesService.getEmployeeById(this.employeeId, filter).subscribe(
        (response) => {
          this.employeeData = response;
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
  getFileIcon(fileType) {
    return this.employeesService.getFileIcon(fileType);
  }
  goBack() {
    this.location.back();
  }
}
