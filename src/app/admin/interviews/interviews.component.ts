import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { EmployeesService } from '../employees/employees.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ToastService } from 'src/app/services/toast.service';
import { RoutingService } from 'src/app/services/routing-service';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
@Component({
  selector: 'app-interviews',
  templateUrl: './interviews.component.html',
  styleUrls: ['./interviews.component.scss'],
})
export class InterviewsComponent implements OnInit {
  breadCrumbItems: any = [];
  currentTableEvent: any;
  totalInterviewsCount: any = 0;
  loading: any;
  appliedFilter: {};
  filterConfig: any[] = [];
  selectedInterviewDetails: any = null;
  isDialogVisible = false;
  searchFilter: any = {};
  interviews: any = [];
  candidateNameToSearch: any;
  countsAnalytics: any[] = [];
  moment: any;
  apiLoading: any;
  interviewStatusCount: { [key: number]: number } = { 1: 0, 2: 0, 3: 0 };
  interviewInternalStatusList: any = projectConstantsLocal.INTERVIEW_STATUS;
  scheduledloactionDetails = projectConstantsLocal.BRANCH_ENTITIES;
  attendedinterviewDetails = projectConstantsLocal.ATTENDED_INTERVIEW_ENTITIES;
  selectedInterviewStatus = this.interviewInternalStatusList[1];
  version = projectConstantsLocal.VERSION_DESKTOP;
  qualificationDetails: any = projectConstantsLocal.QUALIFICATION_ENTITIES;
  capabilities: any;
  currentYear: number;
  constructor(
    private employeesService: EmployeesService,
    private location: Location,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private routingService: RoutingService,
    private dateTimeProcessor: DateTimeProcessorService,
    private localStorageService: LocalStorageService
  ) {
    this.breadCrumbItems = [
      {
        icon: 'fa fa-house',
        label: '  Dashboard',
        routerLink: '/user/dashboard',
        queryParams: { v: this.version },
      },
      { label: 'Interviews' },
    ];
    this.moment = this.dateTimeProcessor.getMoment();
  }

  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
    this.capabilities = this.employeesService.getUserRbac();
    console.log('capabilities', this.capabilities);
    this.updateCountsAnalytics();
    this.setFilterConfig();
    this.getInterviewsStatusCount();
    const storedStatus = this.localStorageService.getItemFromLocalStorage(
      'selectedInterviewStatus'
    );
    if (storedStatus) {
      this.selectedInterviewStatus = storedStatus;
    }
    const storedAppliedFilter =
      this.localStorageService.getItemFromLocalStorage(
        'interviewsAppliedFilter'
      );
    if (storedAppliedFilter) {
      this.appliedFilter = storedAppliedFilter;
    }
  }
  setFilterConfig() {
    this.filterConfig = [
      {
        header: 'Interview Id',
        data: [
          {
            field: 'interviewId',
            title: 'Interview Id',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Candidate Name',
        data: [
          {
            field: 'candidateName',
            title: 'Candidate Name',
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
        header: 'Contact Number',
        data: [
          {
            field: 'primaryPhone',
            title: 'Phone Number',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Date Of Birth',
        data: [
          {
            field: 'dateOfBirth',
            title: 'Date Of Birth',
            type: 'date',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Qualification',
        data: [
          {
            field: 'qualification',
            title: 'Qualification',
            type: 'dropdown',
            filterType: 'like',
            options: this.qualificationDetails.map((entity) => ({
              label: entity.displayName,
              value: entity.name,
            })),
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
      {
        header: 'Current Address',
        data: [
          {
            field: 'currentAddress',
            title: 'Current Address',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Permanent Address',
        data: [
          {
            field: 'permanentAddress',
            title: 'Permanent Address',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Experience',
        data: [
          {
            field: 'experience',
            title: 'Experience',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Scheduled Location',
        data: [
          {
            field: 'scheduledLocation',
            title: 'Scheduled Location',
            type: 'dropdown',
            filterType: 'like',
            options: this.scheduledloactionDetails.map((entity) => ({
              label: entity.displayName,
              value: entity.id,
            })),
          },
        ],
      },
      {
        header: 'Scheduled Date ',
        data: [
          {
            field: 'scheduledDate',
            title: 'Date ',
            type: 'date',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Postponed Date ',
        data: [
          {
            field: 'postponedDate',
            title: 'Date ',
            type: 'date',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Attended Interview?',
        data: [
          {
            field: 'attendedInterview',
            title: 'Attended Interview',
            type: 'dropdown',
            filterType: 'like',
            options: this.attendedinterviewDetails.map((entity) => ({
              label: entity.displayName,
              value: entity.id,
            })),
          },
        ],
      },
      {
        header: 'Reference No',
        data: [
          {
            field: 'referenceNo',
            title: 'Reference No',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
    ];
  }
  updateCountsAnalytics() {
    this.countsAnalytics = [
      {
        icon: 'circle-user',
        name:'all',
        displayName: 'All Interviews',
        count:
          this.interviewStatusCount[1] +
          this.interviewStatusCount[2] +
          this.interviewStatusCount[3],
        textcolor: '#6C5FFC',
        backgroundcolor: '#F0EFFF',
      },
      {
        icon: 'circle-half-stroke',
        name:'pending',
        displayName: 'Pending Interviews',
        count: this.interviewStatusCount[1],
        textcolor: '#FFC107',
        backgroundcolor: '#FFF3D6',
      },
      {
        icon: 'check-circle',
        name:'selected',
        displayName: 'Selected Interviews',
        count: this.interviewStatusCount[2],
        textcolor: '#2ECC71',
        backgroundcolor: '#F0F9E8',
      },
      {
        icon: 'circle-xmark',
        name:'rejected',
        displayName: 'Rejected Interviews',
        count: this.interviewStatusCount[3],
        textcolor: '#DC3545',
        backgroundcolor: '#F8D7DA',
      },
    ];
  }
  cardClick(item: any) {
    this.selectedInterviewStatus = this.interviewInternalStatusList.find(
      (status) => status.name === item.name
    );
    console.log(this.selectedInterviewStatus)
    this.statusChange({ value: this.selectedInterviewStatus });
  }

  actionItems(interview: any): MenuItem[] {
    const menuItems: any = [{ label: 'Actions', items: [] }];
    menuItems[0].items.push({
      label: 'Interview Details',
      icon: 'fa fa-eye',
      command: () => this.showInterviewDetails(interview),
    });
    if (interview.interviewInternalStatus === 1) {
      menuItems[0].items.push({
        label: 'Selected',
        icon: 'fa fa-circle-check',
        command: () => this.selectedInterview(interview),
      });
      menuItems[0].items.push({
        label: 'Rejected',
        icon: 'fa fa-circle-xmark',
        command: () => this.rejectedInterview(interview),
      });
    } else if (interview.interviewInternalStatus === 2) {
      menuItems[0].items.push({
        label: 'Send To Employee',
        icon: 'fa fa-right-to-bracket',
        command: () => this.confirmSendtoEmployee(interview),
      });
      menuItems[0].items.push({
        label: 'Pending',
        icon: 'fa fa-clock-rotate-left',
        command: () => this.pendingInterview(interview),
      });
      menuItems[0].items.push({
        label: 'Rejected',
        icon: 'fa fa-circle-xmark',
        command: () => this.rejectedInterview(interview),
      });
    } else if (interview.interviewInternalStatus === 3) {
      menuItems[0].items.push({
        label: 'Pending',
        icon: 'fa fa-clock-rotate-left',
        command: () => this.pendingInterview(interview),
      });
      menuItems[0].items.push({
        label: 'Selected',
        icon: 'fa fa-circle-check',
        command: () => this.selectedInterview(interview),
      });
    }
    menuItems[0].items.push({
      label: 'Update',
      icon: 'fa fa-pen-to-square',
      command: () => this.updateInterview(interview.interviewId),
    });
    if (this.capabilities.delete) {
      menuItems[0].items.push({
        label: 'Delete',
        icon: 'fa fa-trash',
        command: () => this.confirmDelete(interview),
      });
    }
    return menuItems;
  }

  showInterviewDetails(user: any): void {
    this.selectedInterviewDetails = user;
    this.isDialogVisible = true;
  }
  clearDialog(): void {
    this.selectedInterviewDetails = null;
    this.isDialogVisible = false;
  }

  inputValueChangeEvent(dataType, value) {
    if (value == '') {
      this.searchFilter = {};
      console.log(this.currentTableEvent);
      this.loadInterviews(this.currentTableEvent);
    }
  }

  filterWithCandidateName() {
    let searchFilter = { 'candidateName-like': this.candidateNameToSearch };
    this.applyFilters(searchFilter);
  }
  applyFilters(searchFilter = {}) {
    this.searchFilter = searchFilter;
    console.log(this.currentTableEvent);
    this.loadInterviews(this.currentTableEvent);
  }
  statusChange(event: any): void {
    this.localStorageService.setItemOnLocalStorage(
      'selectedInterviewStatus',
      event.value
    );
    this.loadInterviews(this.currentTableEvent);
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
      'interviewsAppliedFilter',
      this.appliedFilter
    );
    this.loadInterviews(this.currentTableEvent);
  }
  sendToEmployee(interview) {
    this.loading = true;
    const formData: any = {
      employeeName: interview.candidateName,
      primaryPhone: interview.primaryPhone,
      dateOfBirth: interview.dateOfBirth,
      currentAddress: interview.currentAddress,
      experience: interview.experience,
      qualification: interview.qualification,
      permanentAddress: interview.permanentAddress,
    };
    console.log('Form Data:', formData);
    this.employeesService.createEmployeeFromInterview(formData).subscribe(
      (employeeData: any) => {
        if (employeeData?.id) {
          console.log('Created Employee ID:', employeeData.id);
          this.toastService.showSuccess('Employee Created Successfully');
          this.routingService.handleRoute(
            `employees/update/${employeeData.id}`,
            null
          );
          const interviewFormData = {
            candidateName: interview.candidateName,
            referenceNo: employeeData.id,
          };
          console.log('interviewFormData', interviewFormData);
          this.employeesService
            .updateInterview(interview.interviewId, interviewFormData)
            .subscribe(
              (updateResponse: any) => {
                this.loading = false;
                console.log('Update Response:', updateResponse);
              },
              (error: any) => {
                this.loading = false;
                console.error('Interview Update Error:', error);
                this.toastService.showError(error);
              }
            );
        }
      },
      (error: any) => {
        this.loading = false;
        console.error('Employee Creation Error:', error);
        this.toastService.showError(error);
      }
    );
  }
  selectedInterview(interview) {
    this.changeInterviewStatus(interview.interviewId, 2);
  }
  rejectedInterview(interview) {
    this.changeInterviewStatus(interview.interviewId, 3);
  }
  pendingInterview(interview) {
    this.changeInterviewStatus(interview.interviewId, 1);
  }
  changeInterviewStatus(interviewId, statusId) {
    this.loading = true;
    this.employeesService
      .changeInterviewStatus(interviewId, statusId)
      .subscribe(
        (response) => {
          this.toastService.showSuccess(
            'Interview Status Changed Successfully'
          );
          this.loading = false;
          this.loadInterviews(this.currentTableEvent);
        },
        (error: any) => {
          this.loading = false;
          this.toastService.showError(error);
        }
      );
  }

  confirmDelete(interview) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this Interview ? <br>
              Candidate Name: ${interview.candidateName}<br>
              Interview ID: ${interview.interviewId}
              `,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteInterview(interview.interviewId);
      },
    });
  }

  confirmSendtoEmployee(interview) {
    this.confirmationService.confirm({
      message: `Are you sure you want to convert this Candidate : ${interview.candidateName} into an employee?`,
      header: 'Confirm Employment Conversion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.sendToEmployee(interview);
      },
    });
  }
  deleteInterview(interviewId) {
    this.loading = true;
    this.employeesService.deleteInterview(interviewId).subscribe(
      (response: any) => {
        console.log(response);
        this.toastService.showSuccess(response?.message);
        this.loading = false;
        this.loadInterviews(this.currentTableEvent);
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  loadInterviews(event) {
    this.currentTableEvent = event;
    let api_filter = this.employeesService.setFiltersFromPrimeTable(event);
    api_filter = Object.assign(
      {},
      api_filter,
      this.searchFilter,
      this.appliedFilter
    );
    if (this.selectedInterviewStatus) {
      if (this.selectedInterviewStatus && this.selectedInterviewStatus.name) {
        if (this.selectedInterviewStatus.name != 'all') {
          api_filter['interviewInternalStatus-eq'] =
            this.selectedInterviewStatus.id;
        } else {
          api_filter['lastInterviewInternalStatus-or'] = '1,2,3';
        }
      }
    }
    if (api_filter) {
      this.getInterviewCount(api_filter);
      this.getInterviews(api_filter);
    }
  }

  getInterviewCount(filter = {}) {
    this.employeesService.getInterviewCount(filter).subscribe(
      (response) => {
        this.totalInterviewsCount = response;
      },
      (error: any) => {
        this.toastService.showError(error);
      }
    );
  }

  getInterviews(filter = {}) {
    this.apiLoading = true;
    this.employeesService.getInterviews(filter).subscribe(
      (response) => {
        this.interviews = response;
        console.log('Interviews', this.interviews);
        this.apiLoading = false;
      },
      (error: any) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      }
    );
  }

  getInterviewsStatusCount() {
    this.loading = true;
    this.employeesService.getInterviews().subscribe(
      (response) => {
        this.interviewStatusCount = this.countInterviewInternalStatus(response);
        this.updateCountsAnalytics();
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  countInterviewInternalStatus(interviews) {
    const statusCount = { 1: 0, 2: 0, 3: 0 };
    interviews.forEach((interview) => {
      if (interview.interviewInternalStatus in statusCount) {
        statusCount[interview.interviewInternalStatus]++;
      }
    });
    return statusCount;
  }
  getStatusName(statusId) {
    if (
      this.interviewInternalStatusList &&
      this.interviewInternalStatusList.length > 0
    ) {
      let interviewStatusName = this.interviewInternalStatusList.filter(
        (interviewStatus) => interviewStatus.id == statusId
      );
      return (
        (interviewStatusName &&
          interviewStatusName[0] &&
          interviewStatusName[0].name) ||
        ''
      );
    }
    return '';
  }

  getFileIcon(fileType) {
    return this.employeesService.getFileIcon(fileType);
  }

  getStatusColor(status: string): {
    textColor: string;
    backgroundColor: string;
  } {
    switch (status) {
      case 'selected':
        return { textColor: '#5DCC0B', backgroundColor: '#E4F7D6' };
      case 'pending':
        return { textColor: '#FFBA15', backgroundColor: '#FFF3D6' };
      case 'rejected':
        return { textColor: '#FF555A', backgroundColor: '#FFE2E3' };
      default:
        return { textColor: 'black', backgroundColor: 'white' };
    }
  }

  createInterview() {
    this.routingService.handleRoute('interviews/create', null);
  }

  updateInterview(interviewId) {
    this.routingService.handleRoute('interviews/update/' + interviewId, null);
  }

  goBack() {
    this.location.back();
  }
}
