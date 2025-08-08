import { Component } from '@angular/core';
import { Location } from '@angular/common';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { EmployeesService } from '../../employees/employees.service';
import { RoutingService } from 'src/app/services/routing-service';
import { ActivatedRoute } from '@angular/router';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { DialogService } from 'primeng/dynamicdialog';
import { FileUploadComponent } from '../../file-upload/file-upload.component';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ConfirmationService } from 'primeng/api';
@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent {
  heading: any = 'Create User';
  breadCrumbItems: any = [];
  userData: any;
  formFields: any = [];
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;
  actionType: any = 'create';
  loading: any;
  selectedFiles: any = {
    userImage: { filesData: [], links: [], uploadedFiles: [] },
  };
  userId: any;
  version = projectConstantsLocal.VERSION_DESKTOP;
  userForm: UntypedFormGroup;
  designationEntities: any = projectConstantsLocal.DESIGNATION_ENTITIES;
  moment: any;
  capabilities: any;
  currentYear: number;

  constructor(
    private location: Location,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private localStorageService: LocalStorageService,
    private formBuilder: UntypedFormBuilder,
    private toastService: ToastService,
    private employeesService: EmployeesService,
    private routingService: RoutingService,
    private activatedRoute: ActivatedRoute,
    private dateTimeProcessor: DateTimeProcessorService
  ) {
    this.moment = this.dateTimeProcessor.getMoment();
    this.activatedRoute.params.subscribe((params) => {
      if (params && params['id']) {
        this.userId = params['id'];
        this.actionType = 'update';
        this.heading = 'Update User';
        this.getUserById().then((data) => {
          if (data) {
            console.log('User Data', this.userData);
            this.userForm.patchValue({
              firstName: this.userData?.firstName,
              lastName: this.userData?.lastName,
              username: this.userData?.username,
              email: this.userData?.email,
              phoneNumber: this.userData?.phoneNumber,
              designation: this.userData?.designation,
              password: this.userData?.password,
              confirmPassword: this.userData?.confirmPassword,
            });
            if (this.userData.userImage) {
              this.selectedFiles['userImage']['uploadedFiles'] =
                this.userData.userImage;
            }
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
        label: 'Users',
        routerLink: '/user/users',
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

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }
  setEmployeesList() {
    this.formFields = [
      {
        label: 'First Name',
        controlName: 'firstName',
        type: 'text',
        required: true,
      },
      {
        label: 'Last Name',
        controlName: 'lastName',
        type: 'text',
        required: true,
      },

      {
        label: 'Username',
        controlName: 'username',
        type: 'text',
        required: true,
      },

      {
        label: 'Email',
        controlName: 'email',
        type: 'text',
        required: true,
      },
      {
        label: 'Phone Number ',
        controlName: 'phoneNumber',
        type: 'text',
        required: true,
        maxLength: 10,
      },
      {
        label: 'Designation',
        controlName: 'designation',
        type: 'dropdown',
        options: 'designationEntities',
        required: true,
        optionLabel: 'displayName',
        optionValue: 'id',
      },
      {
        label: 'Password',
        controlName: 'password',
        type: 'text',
        required: true,
        isPasswordField: true,
      },
      {
        label: 'Confirm Password',
        controlName: 'confirmPassword',
        type: 'text',
        required: true,
        isPasswordField: true,
      },
      ...(this.actionType == 'update'
        ? [
            {
              label: 'User Image',
              controlName: 'userImage',
              type: 'file',
              required: false,
              uploadFunction: 'uploadFiles',
              acceptedFileTypes: 'image/*',
            },
          ]
        : []),
    ];
  }
  createForm() {
    this.userForm = this.formBuilder.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        username: ['', Validators.required],
        email: ['', Validators.required],
        phoneNumber: ['', Validators.required],
        designation: ['', Validators.required],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: UntypedFormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  getUserById(filter = {}) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.employeesService.getUserById(this.userId, filter).subscribe(
        (response) => {
          this.userData = response;
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

  onSubmit(formValues) {
    let formData: any = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      username: formValues.username,
      email: formValues.email,
      phoneNumber: formValues.phoneNumber,
      designation: formValues.designation,
      designationName: this.getDesignationName(formValues.designation),
      password: formValues.password,
      confirmPassword: formValues.confirmPassword,
      userImage: this.getFileData('userImage'),
    };

    console.log('formData', formData);
    if (this.actionType == 'create') {
      this.loading = true;
      this.employeesService.createUser(formData).subscribe(
        (data) => {
          if (data) {
            this.loading = false;
            this.toastService.showSuccess('User Added Successfully');
            this.routingService.handleRoute('users', null);
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
      this.employeesService.updateUser(this.userId, formData).subscribe(
        (data) => {
          if (data) {
            this.loading = false;
            this.toastService.showSuccess('User Updated Successfully');
            this.routingService.handleRoute('users', null);
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
      console.log(this.userId);
      console.log(fileType);
      this.employeesService
        .uploadFiles(formData, this.userId, fileType)
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

  confirmDelete(file, controlName) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this File?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteFile(file, controlName);
      },
    });
  }

  deleteFile(fileUrl: string, fileType: string) {
    const relativePath = fileUrl.substring(fileUrl.indexOf('/documents'));
    console.log('Before Deletion:', this.selectedFiles);
    this.employeesService.deleteFile(relativePath).subscribe(
      (response: any) => {
        if (response.message === 'File deleted successfully.') {
          console.log('File deleted successfully.');
          if (this.selectedFiles[fileType]?.uploadedFiles) {
            this.selectedFiles[fileType].uploadedFiles = this.selectedFiles[
              fileType
            ].uploadedFiles.filter((f: string) => f !== fileUrl);
            console.log('After Deletion:', this.selectedFiles);
          } else {
            console.error(
              'No uploaded files found for the specified file type.'
            );
          }
          this.toastService.showSuccess('Files Deleted Successfully');
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
