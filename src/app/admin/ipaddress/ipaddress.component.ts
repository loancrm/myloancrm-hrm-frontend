import { Component } from '@angular/core';
import { Location } from '@angular/common';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { EmployeesService } from '../employees/employees.service';
import { RoutingService } from 'src/app/services/routing-service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ConfirmationService } from 'primeng/api';
import { ToastService } from 'src/app/services/toast.service';
import { projectConstantsLocal } from 'src/app/constants/project-constants';

@Component({
  selector: 'app-ipaddress',
  templateUrl: './ipaddress.component.html',
  styleUrls: ['./ipaddress.component.scss'],
})
export class IpaddressComponent {
  breadCrumbItems: any = [];
  formFields: any = [];
  loading: any;
  apiLoading: any;
  appliedFilter: {};
  ipAddressData: any;
  filterConfig: any[] = [];
  totalIpAddressCount: any = 0;

  ipAddressId: any;
  searchFilter: any = {};
  displayNameToSearch: any;
  isDialogVisible = false;
  ipAddresses: any = [];
  currentTableEvent: any;
  ipAddressForm: UntypedFormGroup;
  heading: any = 'Create Ip Address';
  actionType: any = 'create';
  version = projectConstantsLocal.VERSION_DESKTOP;
  capabilities: any;
  dataLoading: any;
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
      { label: 'Ip Address' },
    ];
  }
  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
    this.capabilities = this.employeesService.getUserRbac();
    console.log('capabilities', this.capabilities);
    this.setFilterConfig();
    this.createForm();
    this.setIpAddressList();
    const storedAppliedFilter =
      this.localStorageService.getItemFromLocalStorage(
        'ipAddressAppliedFilter'
      );
    if (storedAppliedFilter) {
      this.appliedFilter = storedAppliedFilter;
    }
  }
  createForm() {
    this.ipAddressForm = this.formBuilder.group({
      ipAddressName: ['', Validators.required],
      ipAddress: ['', Validators.required],
    });
  }

  setFilterConfig() {
    this.filterConfig = [
      {
        header: 'Ip Address Id',
        data: [
          {
            field: 'ipAddressId',
            title: 'Ip Address Id',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Name',
        data: [
          {
            field: 'ipAddressName',
            title: 'Name',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'IP Address',
        data: [
          {
            field: 'ipAddress',
            title: 'IP Address',
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

  setIpAddressList() {
    this.formFields = [
      {
        label: 'Name',
        controlName: 'ipAddressName',
        type: 'text',
        required: true,
      },
      {
        label: 'Ip Address',
        controlName: 'ipAddress',
        type: 'text',
        required: true,
      },
    ];
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
      'ipAddressAppliedFilter',
      this.appliedFilter
    );
    this.loadIpAddresses(this.currentTableEvent);
  }

  applyFilters(searchFilter = {}) {
    this.searchFilter = searchFilter;
    console.log(this.currentTableEvent);
    this.loadIpAddresses(this.currentTableEvent);
  }
  loadIpAddresses(event) {
    this.currentTableEvent = event;
    let api_filter = this.employeesService.setFiltersFromPrimeTable(event);
    api_filter = Object.assign(
      {},
      api_filter,
      this.searchFilter,
      this.appliedFilter
    );
    if (api_filter) {
      this.getIpAddressCount(api_filter);
      this.getIpAddress(api_filter);
    }
  }

  getIpAddressCount(filter = {}) {
    this.employeesService.getIpAddressCount(filter).subscribe(
      (response) => {
        this.totalIpAddressCount = response;
      },
      (error: any) => {
        this.toastService.showError(error);
      }
    );
  }

  getIpAddress(filter = {}) {
    this.apiLoading = true;
    this.employeesService.getIpAddress(filter).subscribe(
      (response) => {
        this.ipAddresses = response;
        console.log('ipAddresses', this.ipAddresses);
        this.apiLoading = false;
      },
      (error: any) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      }
    );
  }

  createIpAddress(): void {
    this.actionType = 'create';
    this.heading = 'Create Ip Address';
    this.isDialogVisible = true;
    this.ipAddressForm.reset();
  }

  clearDialog(): void {
    this.isDialogVisible = false;
    this.ipAddressForm.reset();
  }

  onSubmit(formValues) {
    const formData = {
      ipAddressName: formValues.ipAddressName,
      ipAddress: formValues.ipAddress,
    };
    console.log('formData', formData);
    if (this.actionType == 'create') {
      this.loading = true;
      this.employeesService.createIpAddress(formData).subscribe(
        (data) => {
          if (data) {
            this.loading = false;
            this.isDialogVisible = false;
            this.toastService.showSuccess('Ip Address Added Successfully');
            this.routingService.handleRoute('ipAddress', null);
            this.loadIpAddresses(this.currentTableEvent);
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
        .updateIpAddress(this.ipAddressId, formData)
        .subscribe(
          (data) => {
            if (data) {
              this.loading = false;
              this.isDialogVisible = false;
              this.toastService.showSuccess('Ip Address Updated Successfully');
              this.routingService.handleRoute('ipAddress', null);
              this.loadIpAddresses(this.currentTableEvent);
            }
          },
          (error: any) => {
            this.loading = false;
            this.toastService.showError(error);
          }
        );
    }
  }

  updateIpAddress(ipAddress) {
    this.isDialogVisible = true;
    if (ipAddress && ipAddress?.ipAddressId) {
      this.ipAddressId = ipAddress.ipAddressId;
      this.actionType = 'update';
      this.heading = 'Update Ip Address';
      console.log(this.ipAddressId);

      this.getIpAddressById().then((data) => {
        if (data) {
          console.log(this.ipAddressData);
          this.ipAddressForm.patchValue({
            ipAddress: this.ipAddressData?.ipAddress,
            ipAddressName: this.ipAddressData?.ipAddressName,
          });
        }
      });
    }
  }

  getIpAddressById(filter = {}) {
    return new Promise((resolve, reject) => {
      this.dataLoading = true;
      this.employeesService
        .getIpAddressById(this.ipAddressId, filter)
        .subscribe(
          (response) => {
            this.ipAddressData = response;
            this.dataLoading = false;
            resolve(true);
          },
          (error: any) => {
            this.dataLoading = false;
            resolve(false);
            this.toastService.showError(error);
          }
        );
    });
  }

  confirmDelete(ipAddress) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this Ip Address ? <br>
              Ip Address Name: ${ipAddress.ipAddressName}<br>
              Ip Address ID: ${ipAddress.ipAddressId}
              `,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteIpAddress(ipAddress.ipAddressId);
      },
    });
  }

  deleteIpAddress(ipAddressId) {
    this.loading = true;
    this.employeesService.deleteIpAddress(ipAddressId).subscribe(
      (response: any) => {
        console.log(response);
        this.toastService.showSuccess(response?.message);
        this.loading = false;
        this.loadIpAddresses(this.currentTableEvent);
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }

  goBack() {
    this.location.back();
  }
}
