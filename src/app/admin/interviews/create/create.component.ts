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
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FileUploadComponent } from '../../file-upload/file-upload.component';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent {
  formFields: any = [];
  breadCrumbItems: any = [];
  interviewsData: any;
  moment: any;
  locationEntities: any = projectConstantsLocal.BRANCH_ENTITIES;
  attendedInterviewEntities: any =
    projectConstantsLocal.ATTENDED_INTERVIEW_ENTITIES;
  version = projectConstantsLocal.VERSION_DESKTOP;
  qualificationEntities: any = projectConstantsLocal.QUALIFICATION_ENTITIES;
  interviewId: any;
  interviewsForm: UntypedFormGroup;
  activeIndex: number = 0;
  heading: any = 'Create Interview';
  actionType: any = 'create';
  selectedFiles: any = {
    resume: { filesData: [], links: [], uploadedFiles: [] },
  };
  capabilities: any;
  loading: any;
  currentYear: number;
  constructor(
    private location: Location,
    private formBuilder: UntypedFormBuilder,
    private toastService: ToastService,
    private employeesService: EmployeesService,
    private confirmationService: ConfirmationService,
    private routingService: RoutingService,
    private dialogService: DialogService,
    private activatedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private dateTimeProcessor: DateTimeProcessorService
  ) {
    this.moment = this.dateTimeProcessor.getMoment();
    this.activatedRoute.params.subscribe((params) => {
      if (params && params['id']) {
        this.interviewId = params['id'];
        this.actionType = 'update';
        this.heading = 'Update Interview';
        this.getInterviewById().then((data) => {
          if (data) {
            console.log('Interview Data', this.interviewsData);
            this.interviewsForm.patchValue({
              candidateName: this.interviewsData?.candidateName,
              dateOfBirth: this.interviewsData?.dateOfBirth,
              primaryPhone: this.interviewsData?.primaryPhone,
              qualification: this.interviewsData?.qualification,
              currentAddress: this.interviewsData?.currentAddress,
              permanentAddress: this.interviewsData?.permanentAddress,
              experience: this.interviewsData?.experience,
              scheduledLocation: this.interviewsData?.scheduledLocation,
              scheduledDate: this.interviewsData?.scheduledDate,
              attendedInterview: this.interviewsData?.attendedInterview,
              remarks: this.interviewsData?.remarks,
              postponedDate: this.interviewsData?.postponedDate,
            });
            if (this.interviewsData.resume) {
              this.selectedFiles['resume']['uploadedFiles'] =
                this.interviewsData.resume;
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
        label: 'Interviews',
        routerLink: '/user/interviews',
        queryParams: { v: this.version },
      },
      { label: this.actionType == 'create' ? 'Create' : 'Update' },
    ];
  }
  ngOnInit() {
    this.currentYear = this.employeesService.getCurrentYear();
    this.createForm();
    this.setInterviewsList();
    this.capabilities = this.employeesService.getUserRbac();
    console.log('capabilities', this.capabilities);
  }
  setInterviewsList() {
    this.formFields = [
      {
        label: 'Candidate Name',
        controlName: 'candidateName',
        type: 'text',
        required: true,
      },
      {
        label: 'Date Of Birth',
        controlName: 'dateOfBirth',
        type: 'calendar',
        required: false,
      },
      {
        label: 'Contact Number',
        controlName: 'primaryPhone',
        type: 'text',
        maxLength: 10,
        required: true,
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
        label: 'Current Address',
        controlName: 'currentAddress',
        type: 'text',
        required: false,
      },
      {
        label: 'Permanent Address',
        controlName: 'permanentAddress',
        type: 'text',
        required: false,
      },
      {
        label: 'Experience',
        controlName: 'experience',
        type: 'text',
        required: true,
      },
      {
        label: 'Scheduled Location',
        controlName: 'scheduledLocation',
        type: 'dropdown',
        options: 'locationEntities',
        required: true,
        optionLabel: 'displayName',
        optionValue: 'id',
      },
      {
        label: 'Scheduled Date',
        controlName: 'scheduledDate',
        type: 'calendar',
        required: true,
      },
      {
        label: 'Attended Interview?',
        controlName: 'attendedInterview',
        type: 'dropdown',
        options: 'attendedInterviewEntities',
        required: false,
        optionLabel: 'displayName',
        optionValue: 'id',
      },
      ...(this.actionType == 'update'
        ? [
            {
              label: 'Resume',
              controlName: 'resume',
              type: 'file',
              required: false,
              uploadFunction: 'uploadFiles',
              acceptedFileTypes: '*/*',
            },
          ]
        : []),
      {
        label: 'Remarks',
        controlName: 'remarks',
        type: 'textarea',
        required: true,
      },
    ];
    this.interviewsForm
      .get('attendedInterview')
      ?.valueChanges.subscribe((value) => {
        if (value === 4) {
          if (
            !this.formFields.some(
              (field) => field.controlName === 'postponedDate'
            )
          ) {
            this.formFields.splice(10, 0, {
              label: 'New Scheduled Date',
              controlName: 'postponedDate',
              type: 'calendar',
              required: false,
            });
          }
        } else {
          this.formFields = this.formFields.filter(
            (field) => field.controlName !== 'postponedDate'
          );
        }
      });
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
  createForm() {
    this.interviewsForm = this.formBuilder.group({
      candidateName: ['', Validators.required],
      dateOfBirth: [''],
      primaryPhone: ['', Validators.required],
      currentAddress: [''],
      qualification: ['', Validators.required],
      permanentAddress: [''],
      experience: ['', Validators.required],
      scheduledLocation: ['', Validators.required],
      scheduledDate: ['', Validators.required],
      attendedInterview: [''],
      remarks: ['', Validators.required],
      postponedDate: [''],
    });
  }
  onSubmit(formValues) {
    let formData: any = {
      candidateName: formValues.candidateName,
      dateOfBirth: formValues.dateOfBirth
        ? this.moment(formValues.dateOfBirth).format('YYYY-MM-DD')
        : null,
      primaryPhone: formValues.primaryPhone,
      qualification: formValues.qualification,
      currentAddress: formValues.currentAddress,
      permanentAddress: formValues.permanentAddress,
      experience: formValues.experience,
      scheduledLocation: formValues.scheduledLocation,
      scheduledLocationName: this.getScheduledLocationName(
        formValues.scheduledLocation
      ),
      scheduledDate: formValues.scheduledDate
        ? this.moment(formValues.scheduledDate).format('YYYY-MM-DD')
        : null,
      attendedInterview: formValues.attendedInterview,
      attendedInterviewName: this.getattendedInterviewName(
        formValues.attendedInterview
      ),
      remarks: formValues.remarks,
      postponedDate: formValues.postponedDate
        ? this.moment(formValues.postponedDate).format('YYYY-MM-DD')
        : null,
      resume: this.getFileData('resume'),
    };
    console.log('formData', formData);
    if (this.actionType == 'create') {
      this.loading = true;
      this.employeesService.createInterview(formData).subscribe(
        (data) => {
          if (data) {
            this.loading = false;
            this.toastService.showSuccess('Interview Added Successfully');
            this.routingService.handleRoute('interviews', null);
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
        .updateInterview(this.interviewId, formData)
        .subscribe(
          (data) => {
            if (data) {
              this.loading = false;
              this.toastService.showSuccess('Interview Updated Successfully');
              this.routingService.handleRoute('interviews', null);
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
  getInterviewById(filter = {}) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.employeesService
        .getInterviewById(this.interviewId, filter)
        .subscribe(
          (response) => {
            this.interviewsData = response;
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

  getScheduledLocationName(interviewId) {
    if (this.locationEntities && this.locationEntities.length > 0) {
      let locationName = this.locationEntities.filter(
        (location) => location.id == interviewId
      );
      return (
        (locationName && locationName[0] && locationName[0].displayName) || ''
      );
    }
    return '';
  }

  getattendedInterviewName(interviewId) {
    if (
      this.attendedInterviewEntities &&
      this.attendedInterviewEntities.length > 0
    ) {
      let attendedInterviewName = this.attendedInterviewEntities.filter(
        (name) => name.id == interviewId
      );
      console.log(attendedInterviewName);
      return (
        (attendedInterviewName &&
          attendedInterviewName[0] &&
          attendedInterviewName[0].displayName) ||
        ''
      );
    }
    return '';
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
      console.log(this.interviewId);
      console.log(fileType);
      this.employeesService
        .uploadFiles(formData, this.interviewId, fileType)
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

  getFileIcon(fileType) {
    return this.employeesService.getFileIcon(fileType);
  }
  goBack() {
    this.location.back();
  }
}
