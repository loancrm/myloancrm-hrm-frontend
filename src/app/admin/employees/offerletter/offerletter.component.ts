  import { Component, ElementRef, ViewChild } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import { Location } from '@angular/common';
  import { RoutingService } from 'src/app/services/routing-service';
  import { ToastService } from 'src/app/services/toast.service';
  import { EmployeesService } from '../employees.service';
  import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
  import { projectConstantsLocal } from 'src/app/constants/project-constants';
  import { LocalStorageService } from 'src/app/services/local-storage.service';
  import { CompanySettingsService } from 'src/app/services/company-settings.service';
  import { BranchesService } from 'src/app/services/branches.service';
  import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
  import {
    LetterLayout,
    LetterLayoutService,
  } from 'src/app/services/letter-layout.service';

  @Component({
    selector: 'app-offerletter',
    templateUrl: './offerletter.component.html',
    styleUrls: ['./offerletter.component.scss'],
  })
  export class OfferletterComponent {
    // offerLetterHtml: string = '';
    offerLetterHtml: SafeHtml;

    breadCrumbItems: any = [];
    moment: any;
    @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;
    loading: boolean = false;
    downloadingPDF = false;
    emailingPDF = false;
    version = projectConstantsLocal.VERSION_DESKTOP;
    employees: any = null;
    designations: any = [];
    employeeId: string | null = null;
    offerLetterContent: string | undefined;
    letterLayout: LetterLayout | null = null;
    currentYear: number;
    companySettings: any = {};
    branches: any = [];
    constructor(
      private sanitizer: DomSanitizer,
      private location: Location,
      private route: ActivatedRoute,
      private toastService: ToastService,
      private routingService: RoutingService,
      private localStorageService: LocalStorageService,
      private employeesService: EmployeesService,
      private dateTimeProcessor: DateTimeProcessorService,
      private companySettingsService: CompanySettingsService,
      private branchesService: BranchesService,
      private letterLayoutService: LetterLayoutService
    ) {
      this.moment = this.dateTimeProcessor.getMoment();
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
        { label: 'Offer Letter' },
      ];
      this.getdesignations();
    }

    ngOnInit(): void {
      this.currentYear = this.employeesService.getCurrentYear();
      this.loadCompanySettings();
      this.loadBranches();
      this.employeeId = this.route.snapshot.paramMap.get('id');
      if (this.employeeId) {
        this.getEmployeeById(this.employeeId);
      }

      this.loadCompanySettings();
    this.loadBranches();

    // 🔥 Load OFFER LETTER template
    this.employeesService
      .getTemplateByType('offerLetter')
      .subscribe((res: any) => {
        this.offerLetterContent = res.html;
        this.letterLayout = this.letterLayoutService.parseLayout(res.layoutJson);
        this.prepareOfferLetterHtml(); // 🔥 AUTO FILL HERE
      });

    }

    loadCompanySettings() {
      this.companySettingsService.getCompanySettings().subscribe(
        (response: any) => {
          this.companySettings = response || {};
          this.prepareOfferLetterHtml();
        },
        (error: any) => {
          // Silently fail - use default values if settings not available
          console.error('Error loading company settings:', error);
        }
      );
    }

    loadBranches() {
      this.branchesService.getBranches({ 'branchInternalStatus-eq': 1 }).subscribe(
        (response: any) => {
          this.branches = response || [];
        },
        (error: any) => {
          // Silently fail - use default values if branches not available
          console.error('Error loading branches:', error);
        }
      );
    }

    getBranchesDisplayText(): string {
      if (!this.branches || this.branches.length === 0) {
        return 'multiple branches';
      }
      
      if (this.branches.length === 1) {
        return this.branches[0].displayName;
      }
      
      if (this.branches.length === 2) {
        return `${this.branches[0].displayName} & ${this.branches[1].displayName}`;
      }
      
      // For more than 2 branches, show first two and count
      const firstTwo = this.branches.slice(0, 2).map(b => b.displayName).join(', ');
      const remaining = this.branches.length - 2;
      return `${firstTwo}${remaining > 0 ? ` & ${remaining} more` : ''}`;
    }
    roundToLPA(amount: number): string {
      const lakhs = amount / 100000;
      return lakhs.toFixed(2) + ' LPA';
    }

  downloadPDF() {
    this.generateAndHandlePdf('download');
  }

  emailPDF() {
    this.generateAndHandlePdf('email');
  }

  private async generateAndHandlePdf(mode: 'download' | 'email') {
    const element = document.getElementById('content');
    if (!element) return;

    if (mode === 'download') {
      this.downloadingPDF = true;
    } else {
      this.emailingPDF = true;
    }

    const filename = `${this.employees?.employeeName || 'Employee'} Offer Letter.pdf`;

    try {
      const pdf = await this.letterLayoutService.generateLetterPdf(element, {
        filename,
        layout: this.letterLayout,
        companySettings: this.companySettings,
      });

      if (mode === 'download') {
        pdf.save(filename);
        this.toastService.showSuccess('Offer letter downloaded');
      } else {
        // Build the PDF in memory and send it only as an attachment.
        await this.emailLetterPdf(pdf, filename);
      }
    } catch (err) {
      console.error(err);
      this.toastService.showError(
        mode === 'email'
          ? 'Failed to generate PDF for email'
          : 'Failed to generate PDF'
      );
    } finally {
      this.downloadingPDF = false;
      this.emailingPDF = false;
    }
  }

  private emailLetterPdf(pdf: any, filename: string): Promise<void> {
    const toEmail = (this.employees?.emailAddress || '').trim();
    if (!toEmail) {
      this.toastService.showError(
        'Employee email is missing. Update the employee profile to email the letter.'
      );
      return Promise.resolve();
    }

    let pdfBase64 = '';
    try {
      const dataUri = pdf.output('datauristring');
      pdfBase64 = String(dataUri).includes(',')
        ? String(dataUri).split(',')[1]
        : String(dataUri);
    } catch (e) {
      this.toastService.showError('Could not prepare email attachment.');
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.employeesService
        .sendLetterMail({
          letterType: 'offer',
          toEmail,
          employeeName: this.employees?.employeeName || '',
          designation: this.getDesignationName(this.employees?.designation),
          joiningDate: this.employees?.joiningDate || '',
          companyName: this.companySettings?.companyName || '',
          hrEmail: this.companySettings?.hrEmail || '',
          companyPhone: this.companySettings?.companyPhone || '',
          companyAddress: this.companySettings?.companyAddress || '',
          companyCity: this.companySettings?.companyCity || '',
          filename,
          pdfBase64,
        })
        .subscribe(
          (res: any) => {
            this.toastService.showSuccess(
              res?.message || `Offer letter emailed to ${toEmail}`
            );
            resolve();
          },
          (error: any) => {
            this.toastService.showError(
              error || 'Email failed to send.'
            );
            resolve();
          }
        );
    });
  }

    getOfferLetterDate(joiningDate: string): Date {
      const date = new Date(joiningDate);
      date.setDate(date.getDate() - 2);
      return date;
    }

    getDesignationName(userId) {
      if (this.designations && this.designations.length > 0) {
        let designationName = this.designations.filter(
          (designation) => designation.id == userId
        );
        return (
          (designationName &&
            designationName[0] &&
            designationName[0].designation) ||
          ''
        );
      }
      return '';
    }

    getdesignations(filter = {}) {
      this.loading = true;
      this.employeesService.getDesignations(filter).subscribe(
        (designations: any) => {
          this.designations = [...designations];
          this.loading = false;
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

  //   convertImageToBase64(url: string): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const img = new Image();
  //     img.crossOrigin = 'anonymous';

  //     img.onload = () => {
  //       const canvas = document.createElement('canvas');
  //       canvas.width = img.width;
  //       canvas.height = img.height;

  //       const ctx = canvas.getContext('2d');
  //       ctx?.drawImage(img, 0, 0);

  //       resolve(canvas.toDataURL('image/png'));
  //     };

  //     img.onerror = error => reject(error);

  //     img.src = url;
  //   });
  // }

    prepareOfferLetterHtml() {
      if (!this.offerLetterContent || !this.employees) return;

      let html = this.letterLayoutService.applyLayout(
        this.offerLetterContent,
        this.letterLayout
      );

    const logoUrl = this.companySettings?.companyLogo
  ? (this.companySettings.companyLogo.startsWith('http')
      ? this.companySettings.companyLogo
      : 'https://' + this.companySettings.companyLogo)
  : '';

const logoHtml = logoUrl
  ? `<img 
        src="${logoUrl}" 
        crossorigin="anonymous"
        style="max-height:60px;max-width:140px;width:auto;height:auto;object-fit:contain;display:block;" 
     />`
  : '';
      const watermarkLogoHtml = logoUrl
        ? `<img src="${logoUrl}" crossorigin="anonymous" alt="" />`
        : '';
      // ALL PLACEHOLDERS IN ONE OBJECT
      const replacements: { [key: string]: any } = {
        '{{COMPANY_LOGO}}': logoHtml,
        '{{WATERMARK_LOGO}}': watermarkLogoHtml,

        '{{EMPLOYEE_NAME}}': this.employees.employeeName,
        '{{EMPLOYEE_CITY}}': this.employees.city,
        '{{EMPLOYEE_DISTRICT}}': this.employees.district,
        '{{EMPLOYEE_STATE}}': this.employees.state,
        '{{CREATED_BY}}': this.employees.createdBy,
        '{{CREATED_DATE}}': this.moment(this.employees.createdOn).format('YYYY-MM-DD'),
        '{{JOINING_DATE}}': this.employees.joiningDate,
        '{{DESIGNATION}}': this.getDesignationName(this.employees.designation),
        '{{SALARY}}': this.roundToLPA(this.employees.salary * 12),
        '{{TOTAL_SALARY}}': this.roundToLPA(this.employees.salary * 12),

        '{{COMPANY_NAME}}': this.companySettings.companyName || '',
        '{{HR_EMAIL}}': this.companySettings.hrEmail || '',
        '{{ACCOUNT_EMAIL}}': this.companySettings.accountEmail || '',
        '{{COMPANY_PHONE}}': this.companySettings.companyPhone || '',
        '{{COMPANY_ADDRESS}}': this.companySettings.companyAddress || '',
        '{{COMPANY_CITY}}': this.companySettings.companyCity || '',
        '{{COMPANY_STATE}}': this.companySettings.companyState || '',
        '{{COMPANY_PINCODE}}': this.companySettings.companyPincode || '',
        '{{COMPANY_WEBSITE}}': this.companySettings.companyWebsite || ''
      };

      html = this.letterLayoutService.replacePlaceholders(html, replacements);

      this.offerLetterHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    }

    getEmployeeById(id: string) {
      this.employeesService.getEmployeeById(id).subscribe(res => {
        this.employees = res;
        this.prepareOfferLetterHtml(); 
      });
    }

  }
