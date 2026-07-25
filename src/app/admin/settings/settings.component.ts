import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
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
import {
  OfficePayrollPolicyService,
  ProfessionalTaxTier,
} from 'src/app/services/office-payroll-policy.service';
import {
  IncentiveCalcConfig,
  IncentivePolicyService,
} from 'src/app/services/incentive-policy.service';

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
  officePayrollForm: UntypedFormGroup;
  showBranchDialog: boolean = false;
  branchForm: UntypedFormGroup;
  actionType: string = 'create';
  selectedBranch: any = null;
  logoFile: File | null = null;
  logoPreview: string | null = null;
  uploadingLogo: boolean = false;
  attendanceReportEmails: string[] = [];
  newEmail: string = '';
  employeeUpdateEmails: string[] = [];
  newEmployeeUpdateEmail: string = '';
  // offerLetterTemplates = [];
  // relievingTemplates = [];
  selectedOfferTemplate: string | null = null;
  selectedRelievingTemplate: string | null = null;
  selectedHikeTemplate: string | null = null;
  offerLetterTemplates: any[] = [];
  relievingTemplates: any[] = [];
  hikeLetterTemplates: any[] = [];
  payrollCycleOptions = [
    { label: 'Full Calendar Month (1st – Month End)', value: 'calendar_month' },
    { label: 'Custom Cycle (e.g. 26th → Next 25th)', value: 'custom_day' },
  ];
  incentivePatternOptions = [
    { label: 'Tiered % (min amount slabs)', value: 'tiered' },
    { label: 'Flat % of disbursed amount', value: 'flat' },
  ];
  incentiveConfig: IncentiveCalcConfig;
  professionalTaxTiers: ProfessionalTaxTier[] = [];
  ipRestrictionEnabled: boolean = true;

  constructor(
    private location: Location,
    private router: Router,
    private routingService: RoutingService,
    private localStorageService: LocalStorageService,
    private branchesService: BranchesService,
    private companySettingsService: CompanySettingsService,
    private toastService: ToastService,
    private formBuilder: UntypedFormBuilder,
    private employeesService: EmployeesService,
    private officePayrollPolicyService: OfficePayrollPolicyService,
    private incentivePolicyService: IncentivePolicyService,
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
    // Double-check if user has showSettings capability (guard should handle this, but extra safety)
    const capabilities: any = this.employeesService.getUserRbac();
    if (!capabilities?.showSettings) {
      this.toastService.showError(
        'You do not have permission to access Settings.',
      );
      this.router.navigate(['/user/dashboard'], {
        queryParams: { v: this.version },
      });
      return;
    }

    this.loadBranches();
    this.loadCompanySettings();
    //   this.employeesService.getTemplatesForSelection().subscribe(res => {
    //   this.offerLetterTemplates = res.offerLetter || [];
    //   this.relievingTemplates = res.relievingLetter || [];
    // });
    this.employeesService.getAllTemplates().subscribe((res: any) => {
      this.offerLetterTemplates = res.filter(
        (t) => t.templateType === 'offerLetter' && t.status === 1,
      );

      this.relievingTemplates = res.filter(
        (t) => t.templateType === 'relievingLetter' && t.status === 1,
      );

      this.hikeLetterTemplates = res.filter(
        (t) => t.templateType === 'hikeLetter' && t.status === 1,
      );

      // ✅ ADD EXACTLY HERE
      this.selectedOfferTemplate =
        this.companySettings?.offerLetterTemplateId || null;
      this.selectedRelievingTemplate =
        this.companySettings?.relievingLetterTemplateId || null;
      this.selectedHikeTemplate =
        this.companySettings?.hikeLetterTemplateId || null;
    });
  }

  initializeForms() {
    const defaults = this.officePayrollPolicyService.defaults;
    this.professionalTaxTiers = defaults.professionalTaxTiers.map((t) => ({
      ...t,
    }));
    this.incentiveConfig = this.incentivePolicyService.normalize(null);
    this.companySettingsForm = this.formBuilder.group({
      companyName: [''],
      companyPhone: [''],
      companyAddress: [''],
      companyCity: [''],
      companyState: [''],
      companyPincode: [''],
      companyWebsite: [''],
      companyLogo: [''],
      email: [''],
      appPassword: [''],
      supportEmail: [''],
      hrEmail: [''],
    });

    this.officePayrollForm = this.formBuilder.group({
      officeStartTime: [defaults.officeStartTime, Validators.required],
      officeEndTime: [defaults.officeEndTime, Validators.required],
      graceMinutes: [
        defaults.graceMinutes,
        [Validators.required, Validators.min(0), Validators.max(180)],
      ],
      latesPerLop: [
        defaults.latesPerLop,
        [Validators.required, Validators.min(1), Validators.max(31)],
      ],
      payrollCycleType: [defaults.payrollCycleType, Validators.required],
      payrollCycleStartDay: [
        defaults.payrollCycleStartDay,
        [Validators.required, Validators.min(1), Validators.max(28)],
      ],
      ipRestrictionEnabled: [true],
      casualLeavesPerMonth: [
        defaults.casualLeavesPerMonth,
        [Validators.required, Validators.min(0), Validators.max(31)],
      ],
      casualLeaveAfterMonths: [
        defaults.casualLeaveAfterMonths,
        [Validators.required, Validators.min(0), Validators.max(60)],
      ],
    });

    this.branchForm = this.formBuilder.group({
      displayName: ['', Validators.required],
      name: ['', Validators.required],
      address: [''],
    });
  }

  get lateCutoffPreview(): string {
    const start =
      this.officePayrollForm?.get('officeStartTime')?.value || '10:00';
    const grace = Number(
      this.officePayrollForm?.get('graceMinutes')?.value || 0,
    );
    const [h, m] = start.split(':').map(Number);
    const total = h * 60 + m + (Number.isFinite(grace) ? grace : 0);
    const hh = String(Math.floor(total / 60) % 24).padStart(2, '0');
    const mm = String(total % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  get isCustomPayrollCycle(): boolean {
    return (
      this.officePayrollForm?.get('payrollCycleType')?.value === 'custom_day'
    );
  }

  loadBranches() {
    this.loading = true;
    this.branchesService
      .getBranches({ 'branchInternalStatus-eq': 1 })
      .subscribe(
        (response: any) => {
          this.branches = response || [];
          this.loading = false;
        },
        (error: any) => {
          this.loading = false;
          this.toastService.showError(error);
        },
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
          companyLogo: this.companySettings.companyLogo || '',
          email: this.companySettings.email || '',
          appPassword: this.companySettings.appPassword || '',
          supportEmail: this.companySettings.supportEmail || '',
          hrEmail: this.companySettings.hrEmail || '',
        });
        // Set logo preview if logo exists
        if (this.companySettings.companyLogo) {
          this.logoPreview = this.companySettings.companyLogo;
        } else {
          this.logoPreview = null;
        }

        // Load attendance report emails
        if (this.companySettings.attendanceReportEmails) {
          // Check if it's already an array (parsed by parseNestedJSON middleware)
          if (Array.isArray(this.companySettings.attendanceReportEmails)) {
            this.attendanceReportEmails =
              this.companySettings.attendanceReportEmails;
          } else if (
            typeof this.companySettings.attendanceReportEmails === 'string'
          ) {
            // It's a string, try to parse it
            try {
              const parsed = JSON.parse(
                this.companySettings.attendanceReportEmails,
              );
              this.attendanceReportEmails = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              // If not JSON, try comma-separated
              this.attendanceReportEmails =
                this.companySettings.attendanceReportEmails
                  .split(',')
                  .map((email: string) => email.trim())
                  .filter((email: string) => email.length > 0);
            }
          } else {
            this.attendanceReportEmails = [];
          }
        } else {
          this.attendanceReportEmails = [];
        }

        // Load employee update emails
        if (this.companySettings.employeeUpdateEmails) {
          // Check if it's already an array (parsed by parseNestedJSON middleware)
          if (Array.isArray(this.companySettings.employeeUpdateEmails)) {
            this.employeeUpdateEmails =
              this.companySettings.employeeUpdateEmails;
          } else if (
            typeof this.companySettings.employeeUpdateEmails === 'string'
          ) {
            // It's a string, try to parse it
            try {
              const parsed = JSON.parse(
                this.companySettings.employeeUpdateEmails,
              );
              this.employeeUpdateEmails = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              // If not JSON, try comma-separated
              this.employeeUpdateEmails =
                this.companySettings.employeeUpdateEmails
                  .split(',')
                  .map((email: string) => email.trim())
                  .filter((email: string) => email.length > 0);
            }
          } else {
            this.employeeUpdateEmails = [];
          }
        } else {
          this.employeeUpdateEmails = [];
        }

        const policy = this.officePayrollPolicyService.normalize(
          this.companySettings,
        );
        this.professionalTaxTiers = policy.professionalTaxTiers.map((t) => ({
          ...t,
        }));
        this.officePayrollForm.patchValue({
          ...policy,
          ipRestrictionEnabled:
            this.companySettings.ipRestrictionEnabled === 0 ||
            this.companySettings.ipRestrictionEnabled === false ||
            this.companySettings.ipRestrictionEnabled === '0'
              ? false
              : true,
        });
        this.ipRestrictionEnabled =
          this.officePayrollForm.get('ipRestrictionEnabled')?.value !== false;
        this.incentiveConfig =
          this.incentivePolicyService.normalizeFromSettings(
            this.companySettings,
          );
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      },
    );
  }

  addIncentiveTier() {
    this.incentiveConfig.tiers = [
      ...(this.incentiveConfig.tiers || []),
      this.incentivePolicyService.createEmptyTier(),
    ];
  }

  incentiveTierRewardOptions = [
    { label: 'Rate (%)', value: 'rate' },
    { label: 'Fixed Amount (₹)', value: 'fixed' },
  ];

  removeIncentiveTier(index: number) {
    this.incentiveConfig.tiers = this.incentiveConfig.tiers.filter(
      (_, i) => i !== index,
    );
  }

  saveIncentiveSettings() {
    const config = this.incentivePolicyService.normalize(this.incentiveConfig);
    if (
      config.pattern === 'tiered' &&
      (!config.tiers || !config.tiers.length)
    ) {
      this.toastService.showError('Add at least one incentive tier');
      return;
    }
    this.loading = true;
    this.companySettingsService
      .updateCompanySettings({
        incentiveCalcConfig: this.incentivePolicyService.toStorageJson(config),
      })
      .subscribe(
        () => {
          this.loading = false;
          this.toastService.showSuccess(
            'Incentive calculation settings updated',
          );
          this.loadCompanySettings();
        },
        (error: any) => {
          this.loading = false;
          this.toastService.showError(error);
        },
      );
  }

  addProfessionalTaxTier() {
    this.professionalTaxTiers = [
      ...(this.professionalTaxTiers || []),
      { minSalary: 0, taxAmount: 0 },
    ];
  }

  removeProfessionalTaxTier(index: number) {
    this.professionalTaxTiers = this.professionalTaxTiers.filter(
      (_, i) => i !== index,
    );
  }

  saveOfficePayrollSettings() {
    if (this.officePayrollForm.invalid) {
      this.toastService.showError(
        'Please fill all office & payroll policy fields correctly',
      );
      return;
    }
    const formValue = this.officePayrollForm.value;
    const payload = {
      officeStartTime: formValue.officeStartTime,
      officeEndTime: formValue.officeEndTime,
      graceMinutes: Number(formValue.graceMinutes),
      latesPerLop: Number(formValue.latesPerLop),
      payrollCycleType: formValue.payrollCycleType,
      payrollCycleStartDay: Number(formValue.payrollCycleStartDay),
      ipRestrictionEnabled: formValue.ipRestrictionEnabled ? 1 : 0,
      casualLeavesPerMonth: Number(formValue.casualLeavesPerMonth),
      casualLeaveAfterMonths: Number(formValue.casualLeaveAfterMonths),
      professionalTaxConfig:
        this.officePayrollPolicyService.toProfessionalTaxStorageJson(
          this.professionalTaxTiers,
        ),
    };
    this.loading = true;
    this.companySettingsService.updateCompanySettings(payload).subscribe(
      () => {
        this.loading = false;
        this.toastService.showSuccess(
          'Office & payroll policy updated successfully',
        );
        this.loadCompanySettings();
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      },
    );
  }

  saveCompanySettings() {
    if (this.companySettingsForm.valid) {
      this.loading = true;
      const payload = { ...this.companySettingsForm.value };

      // Logo is managed only via Upload / Remove buttons.
      // Never wipe an existing logo when saving address/details.
      const existingLogo = this.companySettings?.companyLogo || '';
      if (payload.companyLogo) {
        // keep submitted logo url
      } else if (existingLogo) {
        payload.companyLogo = existingLogo;
      } else {
        delete payload.companyLogo;
      }

      this.companySettingsService.updateCompanySettings(payload).subscribe(
        (response: any) => {
          this.loading = false;
          this.toastService.showSuccess(
            'Company settings updated successfully',
          );
          this.loadCompanySettings();
        },
        (error: any) => {
          this.loading = false;
          this.toastService.showError(error);
        },
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
          },
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
            },
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
      },
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
        this.toastService.showError(
          'Please select a valid image file (PNG, JPG, JPEG, GIF, or WEBP)',
        );
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
      this.toastService.showError(
        'Account ID not found. Please refresh and try again.',
      );
      return;
    }

    this.uploadingLogo = true;
    const formData = new FormData();
    formData.append('files', this.logoFile);

    // Upload to file service: https://hrfiles.thefintalk.in/hrfiles?type=companyLogo&employeeId={accountId}
    // Using 'companyLogo' as type and accountId as the identifier
    this.employeesService
      .uploadFiles(formData, accountId, 'companyLogo')
      .subscribe(
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
                  this.logoFile = null;
                  this.logoPreview = logoUrl;
                  if (this.companySettings) {
                    this.companySettings.companyLogo = logoUrl;
                  }
                  this.toastService.showSuccess('Logo uploaded successfully');
                  this.loadCompanySettings(); // Reload to get updated settings
                },
                (error: any) => {
                  this.loading = false;
                  this.uploadingLogo = false;
                  this.toastService.showError(error);
                },
              );
          } else {
            this.uploadingLogo = false;
            this.toastService.showError(
              'Failed to upload logo - no URL returned',
            );
          }
        },
        (error: any) => {
          this.uploadingLogo = false;
          this.toastService.showError(error);
        },
      );
  }

  removeLogo() {
    if (!this.companySettings?.companyLogo) return;

    // Extract relative path starting after domain
    const relativePath = this.companySettings.companyLogo.split(
      'hrfiles.thefintalk.in/',
    )[1];

    this.loading = true;
    this.uploadingLogo = true;

    this.employeesService.deleteFile(relativePath).subscribe(
      (res: any) => {
        if (res.message === 'File deleted successfully.') {
          this.logoFile = null;
          this.logoPreview = null;
          this.companySettingsForm.patchValue({ companyLogo: '' });

          // Update DB
          this.companySettingsService
            .updateCompanySettings({ companyLogo: '' })
            .subscribe(
              () => {
                this.loading = false;
                this.uploadingLogo = false;
                this.toastService.showSuccess('Logo removed successfully');
                this.loadCompanySettings();
              },
              (error: any) => {
                this.loading = false;
                this.uploadingLogo = false;
                this.toastService.showError(error);
              },
            );
        } else {
          this.loading = false;
          this.uploadingLogo = false;
          this.toastService.showError(
            res.error || 'Failed to delete logo on server',
          );
        }
      },
      (error: any) => {
        this.loading = false;
        this.uploadingLogo = false;
        this.toastService.showError(error || 'Failed to delete logo on server');
      },
    );
  }

  addAttendanceReportEmail() {
    if (this.newEmail && this.newEmail.trim()) {
      const email = this.newEmail.trim();
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.toastService.showError('Please enter a valid email address');
        return;
      }
      // Check if email already exists
      if (this.attendanceReportEmails.includes(email)) {
        this.toastService.showError('This email is already added');
        return;
      }
      this.attendanceReportEmails.push(email);
      this.newEmail = '';
      this.saveAttendanceReportEmails();
    }
  }

  removeAttendanceReportEmail(email: string) {
    this.attendanceReportEmails = this.attendanceReportEmails.filter(
      (e) => e !== email,
    );
    this.saveAttendanceReportEmails();
  }

  saveAttendanceReportEmails() {
    const emailsJson = JSON.stringify(this.attendanceReportEmails);
    this.loading = true;
    this.companySettingsService
      .updateCompanySettings({ attendanceReportEmails: emailsJson })
      .subscribe(
        (response: any) => {
          this.loading = false;
          this.toastService.showSuccess(
            'Attendance report emails updated successfully',
          );
          this.loadCompanySettings();
        },
        (error: any) => {
          this.loading = false;
          this.toastService.showError(error);
        },
      );
  }

  addEmployeeUpdateEmail() {
    if (this.newEmployeeUpdateEmail && this.newEmployeeUpdateEmail.trim()) {
      const email = this.newEmployeeUpdateEmail.trim();
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.toastService.showError('Please enter a valid email address');
        return;
      }
      // Check if email already exists
      if (this.employeeUpdateEmails.includes(email)) {
        this.toastService.showError('This email is already added');
        return;
      }
      this.employeeUpdateEmails.push(email);
      this.newEmployeeUpdateEmail = '';
      this.saveEmployeeUpdateEmails();
    }
  }

  removeEmployeeUpdateEmail(email: string) {
    this.employeeUpdateEmails = this.employeeUpdateEmails.filter(
      (e) => e !== email,
    );
    this.saveEmployeeUpdateEmails();
  }

  saveEmployeeUpdateEmails() {
    const emailsJson = JSON.stringify(this.employeeUpdateEmails);
    this.loading = true;
    this.companySettingsService
      .updateCompanySettings({ employeeUpdateEmails: emailsJson })
      .subscribe(
        (response: any) => {
          this.loading = false;
          this.toastService.showSuccess(
            'Employee update emails updated successfully',
          );
          this.loadCompanySettings();
        },
        (error: any) => {
          this.loading = false;
          this.toastService.showError(error);
        },
      );
  }

  saveEmailCredentials() {
    if (
      this.companySettingsForm.get('email')?.value &&
      this.companySettingsForm.get('appPassword')?.value
    ) {
      this.loading = true;
      const emailData = {
        email: this.companySettingsForm.get('email')?.value,
        appPassword: this.companySettingsForm.get('appPassword')?.value,
      };
      this.companySettingsService.updateCompanySettings(emailData).subscribe(
        (response: any) => {
          this.loading = false;
          this.toastService.showSuccess('Email credentials saved successfully');
          // Clear password field after saving
          this.companySettingsForm.patchValue({ appPassword: '' });
          this.loadCompanySettings();
        },
        (error: any) => {
          this.loading = false;
          this.toastService.showError(error);
        },
      );
    } else {
      this.toastService.showError('Please enter both email and app password');
    }
  }
  //   goToCustomTemplate() {
  //   this.router.navigate(['/user/customtemplate']);
  // }
  goToCustomTemplate() {
    this.routingService.handleRoute('settings/customtemplate', null);
  }
  // saveTemplateSelection(type: string) {
  //   const templateId =
  //     type === 'offerLetter'
  //       ? this.selectedOfferTemplate
  //       : this.selectedRelievingTemplate;

  //   // 🔥 HARD GUARD — NO NULL ALLOWED
  //   if (!templateId) {
  //     this.toastService.showError('Please select a template');
  //     return;
  //   }

  //   this.employeesService.selectTemplate({
  //     templateId: templateId,   // ✅ always string
  //     templateType: type
  //   }).subscribe(() => {
  //     this.toastService.showSuccess('Template selected');
  //   });
  // }
  saveTemplateSelection(type: string) {
    let templateId: string | null = null;

    if (type === 'offerLetter') {
      templateId = this.selectedOfferTemplate;
    } else if (type === 'relievingLetter') {
      templateId = this.selectedRelievingTemplate;
    } else if (type === 'hikeLetter') {
      templateId = this.selectedHikeTemplate;
    }

    // 🔒 HARD GUARD
    if (!templateId) {
      this.toastService.showError('Please select a template');
      return;
    }

    this.employeesService
      .selectTemplate({
        templateId: templateId,
        templateType: type,
      })
      .subscribe(() => {
        this.toastService.showSuccess('Template selected');
      });
  }

  // saveTemplateSelection(type: string) {
  //   const templateId =
  //     type === 'offerLetter'
  //       ? this.selectedOfferTemplate
  //       : this.selectedRelievingTemplate;

  //   this.employeesService.selectTemplate({
  //     templateId,
  //     templateType: type
  //   }).subscribe(() => {
  //     this.toastService.showSuccess('Template selected');
  //   });
  // }
}
