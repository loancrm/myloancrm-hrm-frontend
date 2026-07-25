import { Component, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { RoutingService } from 'src/app/services/routing-service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { EmployeesService } from '../employees.service';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
import { CompanySettingsService } from 'src/app/services/company-settings.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  LetterLayout,
  LetterLayoutService,
} from 'src/app/services/letter-layout.service';
@Component({
  selector: 'app-relievingletter',
  templateUrl: './relievingletter.component.html',
  styleUrls: ['./relievingletter.component.scss'],
})
export class RelievingletterComponent {
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
  currentYear: number;
  apiLoading: any;
  companySettings: any = {};
  relievingLetterHtml: SafeHtml;
  relievingLetterContent: string;
  letterLayout: LetterLayout | null = null;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private sanitizer: DomSanitizer,
    private routingService: RoutingService,
    private localStorageService: LocalStorageService,
    private employeesService: EmployeesService,
    private dateTimeProcessor: DateTimeProcessorService,
    private companySettingsService: CompanySettingsService,
    private letterLayoutService: LetterLayoutService,
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
      { label: 'Relieving Letter' },
    ];
    this.getdesignations();
  }

  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
    this.loadCompanySettings();
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.getEmployeeById(this.employeeId);
    }
    this.employeesService
      .getTemplateByType('relievingLetter')
      .subscribe((res: any) => {
        this.relievingLetterContent = res.html;
        this.letterLayout = this.letterLayoutService.parseLayout(
          res.layoutJson,
        );
        this.prepareRelievingLetterHtml();
      });
  }

  loadCompanySettings() {
    this.companySettingsService.getCompanySettings().subscribe(
      (response: any) => {
        this.companySettings = response || {};
        this.prepareRelievingLetterHtml();
      },
      (error: any) => {
        // Silently fail - use default values if settings not available
        console.error('Error loading company settings:', error);
      },
    );
  }
  roundToLPA(amount: number): string {
    const lakhs = amount / 100000;
    return lakhs.toFixed(2) + ' LPA';
  }

  // generatePDF() {
  //   const element = document.getElementById('content');
  //   if (element) {
  //     this.loading = true;
  //     html2pdf()
  //       .from(element)
  //       .save(`${this.employees?.employeeName} Relieving Letter.pdf`)
  //       .then(() => {
  //         this.loading = false;
  //       })
  //       .catch((error) => {
  //         console.error('PDF generation error:', error);
  //         this.loading = false;
  //       });
  //   }
  // }

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

    const filename = `${this.employees?.employeeName || 'Employee'} Relieving Letter.pdf`;

    try {
      const pdf = await this.letterLayoutService.generateLetterPdf(element, {
        filename,
        layout: this.letterLayout,
        companySettings: this.companySettings,
      });

      if (mode === 'download') {
        pdf.save(filename);
        this.toastService.showSuccess('Relieving letter downloaded');
      } else {
        await this.emailLetterPdf(pdf, filename);
      }
    } catch (err) {
      console.error(err);
      this.toastService.showError(
        mode === 'email'
          ? 'Failed to generate PDF for email'
          : 'Failed to generate PDF',
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
        'Employee email is missing. Update the employee profile to email the letter.',
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
          letterType: 'relieving',
          toEmail,
          employeeName: this.employees?.employeeName || '',
          designation: this.getDesignationName(this.employees?.designation),
          lastWorkingDate:
            this.employees?.resignedDate ||
            this.employees?.terminationDate ||
            '',
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
              res?.message || `Relieving letter emailed to ${toEmail}`,
            );
            resolve();
          },
          (error: any) => {
            this.toastService.showError(error || 'Email failed to send.');
            resolve();
          },
        );
    });
  }
  // getEmployeeById(id: string) {
  //   this.apiLoading = true;
  //   this.employeesService.getEmployeeById(id).subscribe(
  //     (response) => {
  //       this.employees = response;
  //       this.apiLoading = false;
  //     },
  //     (error: any) => {
  //       this.apiLoading = false;
  //       this.toastService.showError(error);
  //     }
  //   );
  // }

  getDesignationName(userId) {
    if (this.designations && this.designations.length > 0) {
      let designationName = this.designations.filter(
        (designation) => designation.id == userId,
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
      },
    );
  }

  prepareRelievingLetterHtml() {
    if (!this.relievingLetterContent || !this.employees) return;

    let html = this.letterLayoutService.applyLayout(
      this.relievingLetterContent,
      this.letterLayout,
    );

    const logoUrl = this.companySettings?.companyLogo
      ? this.companySettings.companyLogo.startsWith('http')
        ? this.companySettings.companyLogo
        : 'https://' + this.companySettings.companyLogo
      : '';

    const logoHtml = logoUrl
      ? `<img src="${logoUrl}"
             style="max-height:60px;max-width:140px;width:auto;height:auto;object-fit:contain;display:block;" />`
      : '';
    const watermarkLogoHtml = logoUrl
      ? `<img src="${logoUrl}" crossorigin="anonymous" alt="" />`
      : '';

    // ALL PLACEHOLDERS IN ONE OBJECT
    const replacements: { [key: string]: any } = {
      '{{COMPANY_LOGO}}': logoHtml,
      '{{WATERMARK_LOGO}}': watermarkLogoHtml,

      '{{EMPLOYEE_NAME}}': this.employees.employeeName,
      '{{EMPLOYEE_CITY}}': this.employees.employeeCity,
      '{{DESIGNATION}}': this.getDesignationName(this.employees.designation),
      '{{JOINING_DATE}}': this.employees.joiningDate,
      '{{RELIEVING_DATE}}':
        this.employees.resignedDate || this.employees.terminationDate,
      '{{CREATED_BY}}': this.employees.createdBy,

      '{{COMPANY_NAME}}': this.companySettings.companyName || '',
      '{{HR_EMAIL}}': this.companySettings.hrEmail || '',
      '{{ACCOUNT_EMAIL}}': this.companySettings.accountEmail || '',
      '{{COMPANY_PHONE}}': this.companySettings.companyPhone || '',
      '{{COMPANY_ADDRESS}}': this.companySettings.companyAddress || '',
      '{{COMPANY_CITY}}': this.companySettings.companyCity || '',
      '{{COMPANY_STATE}}': this.companySettings.companyState || '',
      '{{COMPANY_PINCODE}}': this.companySettings.companyPincode || '',
      '{{COMPANY_WEBSITE}}': this.companySettings.companyWebsite || '',
    };

    html = this.letterLayoutService.replacePlaceholders(html, replacements);

    this.relievingLetterHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }
  getEmployeeById(id: string) {
    this.apiLoading = true;
    this.employeesService.getEmployeeById(id).subscribe(
      (response) => {
        this.employees = response;
        this.apiLoading = false;

        // THIS LINE WAS MISSING
        this.prepareRelievingLetterHtml();
      },
      (error) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      },
    );
  }

  goBack() {
    this.location.back();
  }
}
