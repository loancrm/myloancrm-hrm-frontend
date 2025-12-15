import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { RoutingService } from 'src/app/services/routing-service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { BranchesService } from 'src/app/services/branches.service';
import { CompanySettingsService } from 'src/app/services/company-settings.service';
import { ToastService } from 'src/app/services/toast.service';
import { EmployeesService } from '../employees/employees.service';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  breadCrumbItems: any = [];
  version = projectConstantsLocal.VERSION_DESKTOP;
  activeTab: string = 'branches';
  loading: boolean = false;
  branches: any = [];
  companySettings: any = {};
  companySettingsForm: UntypedFormGroup;
  showBranchDialog: boolean = false;
  branchForm: UntypedFormGroup;
  actionType: string = 'create';
  selectedBranch: any = null;
  logoFile: File | null = null;
  logoPreview: string | null = null;
  uploadingLogo: boolean = false;

  constructor(
    private location: Location,
    private routingService: RoutingService,
    private localStorageService: LocalStorageService,
    private branchesService: BranchesService,
    private companySettingsService: CompanySettingsService,
    private toastService: ToastService,
    private formBuilder: UntypedFormBuilder,
    private employeesService: EmployeesService
  ) {
    this.breadCrumbItems = [
      {
        icon: 'fa fa-house',
        label: ' Dashboard',
        routerLink: '/user/dashboard',
        queryParams: { v: this.version },
      },
      { label: 'Settings' },
    ];
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadBranches();
    this.loadCompanySettings();
  }

  initializeForms() {
    this.companySettingsForm = this.formBuilder.group({
      companyName: [''],
      companyPhone: [''],
      companyAddress: [''],
      companyCity: [''],
      companyState: [''],
      companyPincode: [''],
      companyWebsite: [''],
      companyLogo: [''],
    });

    this.branchForm = this.formBuilder.group({
      displayName: ['', Validators.required],
      name: ['', Validators.required],
      address: [''],
    });
  }

  loadBranches() {
    this.loading = true;
    this.branchesService.getBranches({ 'branchInternalStatus-eq': 1 }).subscribe(
      (response: any) => {
        this.branches = response || [];
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }

  loadCompanySettings() {
    this.loading = true;
    this.companySettingsService.getCompanySettings().subscribe(
      (response: any) => {
        this.companySettings = response || {};
        this.companySettingsForm.patchValue({
          companyName: this.companySettings.companyName || '',
          companyPhone: this.companySettings.companyPhone || '',
          companyAddress: this.companySettings.companyAddress || '',
          companyCity: this.companySettings.companyCity || '',
          companyState: this.companySettings.companyState || '',
          companyPincode: this.companySettings.companyPincode || '',
          companyWebsite: this.companySettings.companyWebsite || '',
        });
        // Set logo preview if logo exists
        if (this.companySettings.companyLogo) {
          this.logoPreview = this.companySettings.companyLogo;
        }
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }

  saveCompanySettings() {
    if (this.companySettingsForm.valid) {
      this.loading = true;
      this.companySettingsService
        .updateCompanySettings(this.companySettingsForm.value)
        .subscribe(
          (response: any) => {
            this.loading = false;
            this.toastService.showSuccess('Company settings updated successfully');
            this.loadCompanySettings();
          },
          (error: any) => {
            this.loading = false;
            this.toastService.showError(error);
          }
        );
    }
  }

  openBranchDialog(action: string, branch?: any) {
    this.actionType = action;
    this.selectedBranch = branch || null;
    if (action === 'create') {
      this.branchForm.reset();
    } else if (action === 'update' && branch) {
      this.branchForm.patchValue({
        displayName: branch.displayName || '',
        name: branch.name || '',
        address: branch.address || '',
      });
    }
    this.showBranchDialog = true;
  }

  closeBranchDialog() {
    this.showBranchDialog = false;
    this.branchForm.reset();
    this.selectedBranch = null;
  }

  saveBranch() {
    if (this.branchForm.valid) {
      this.loading = true;
      const branchData = this.branchForm.value;
      
      if (this.actionType === 'create') {
        this.branchesService.createBranch(branchData).subscribe(
          (response: any) => {
            this.loading = false;
            this.toastService.showSuccess('Branch created successfully');
            this.closeBranchDialog();
            this.loadBranches();
          },
          (error: any) => {
            this.loading = false;
            this.toastService.showError(error);
          }
        );
      } else if (this.actionType === 'update' && this.selectedBranch) {
        this.branchesService
          .updateBranch(this.selectedBranch.branchId, branchData)
          .subscribe(
            (response: any) => {
              this.loading = false;
              this.toastService.showSuccess('Branch updated successfully');
              this.closeBranchDialog();
              this.loadBranches();
            },
            (error: any) => {
              this.loading = false;
              this.toastService.showError(error);
            }
          );
      }
    }
  }

  deleteBranch(branch: any) {
    this.loading = true;
    this.branchesService.deleteBranch(branch.branchId).subscribe(
      (response: any) => {
        this.loading = false;
        this.toastService.showSuccess('Branch deleted successfully');
        this.loadBranches();
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onLogoFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/image\/(png|jpg|jpeg|gif|webp)/)) {
        this.toastService.showError('Please select a valid image file (PNG, JPG, JPEG, GIF, or WEBP)');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.showError('File size should be less than 5MB');
        return;
      }
      this.logoFile = file;
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadLogo() {
    if (!this.logoFile) {
      this.toastService.showError('Please select a logo file');
      return;
    }

    // Get accountId from companySettings - required for file upload
    const accountId = this.companySettings?.accountId;
    if (!accountId) {
      this.toastService.showError('Account ID not found. Please refresh and try again.');
      return;
    }

    this.uploadingLogo = true;
    const formData = new FormData();
    formData.append('files', this.logoFile);
    
    // Upload to file service: https://hrfiles.thefintalk.in/hrfiles?type=companyLogo&employeeId={accountId}
    // Using 'companyLogo' as type and accountId as the identifier
    this.employeesService.uploadFiles(formData, accountId, 'companyLogo').subscribe(
      (response: any) => {
        if (response && response.links && response.links.length > 0) {
          const logoUrl = response.links[0];
          // Update company settings with logo URL
          this.companySettingsForm.patchValue({ companyLogo: logoUrl });
          // Save the logo URL to company settings in database
          this.loading = true;
          this.companySettingsService
            .updateCompanySettings({ companyLogo: logoUrl })
            .subscribe(
              (updateResponse: any) => {
                this.loading = false;
                this.uploadingLogo = false;
                this.toastService.showSuccess('Logo uploaded successfully');
                this.loadCompanySettings(); // Reload to get updated settings
              },
              (error: any) => {
                this.loading = false;
                this.uploadingLogo = false;
                this.toastService.showError(error);
              }
            );
        } else {
          this.uploadingLogo = false;
          this.toastService.showError('Failed to upload logo - no URL returned');
        }
      },
      (error: any) => {
        this.uploadingLogo = false;
        this.toastService.showError(error);
      }
    );
  }

  removeLogo() {
    this.logoFile = null;
    this.logoPreview = null;
    this.companySettingsForm.patchValue({ companyLogo: '' });
  }
}

