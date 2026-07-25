import { Component, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { RoutingService } from 'src/app/services/routing-service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { EmployeesService } from '../../employees/employees.service';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
import { CompanySettingsService } from 'src/app/services/company-settings.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  LetterLayout,
  LetterLayoutService,
} from 'src/app/services/letter-layout.service';
@Component({
  selector: 'app-hikeletter',
  templateUrl: './hikeletter.component.html',
  styleUrls: ['./hikeletter.component.scss'],
})
export class HikeletterComponent {
  breadCrumbItems: any = [];
  moment: any;
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;
  loading: boolean = false;
  downloadingPDF = false;
  emailingPDF = false;
  version = projectConstantsLocal.VERSION_DESKTOP;
  employees: any = null;
  salaryHikes: any = [];
  designations: any = [];
  employeeId: string | null = null;
  currentYear: number;
  apiLoading: any;
  companySettings: any = {};
  hikeLetterContent!: string;
  hikeLetterHtml!: SafeHtml;
  letterLayout: LetterLayout | null = null;
  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private routingService: RoutingService,
    private localStorageService: LocalStorageService,
    private employeesService: EmployeesService,
    private dateTimeProcessor: DateTimeProcessorService,
    private companySettingsService: CompanySettingsService,
    private sanitizer: DomSanitizer,
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
        label: 'Salary Hikes',
        routerLink: '/user/salaryhikes',
        queryParams: { v: this.version },
      },
      { label: 'Hike Letter' },
    ];
    this.getdesignations();
  }

  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
    this.loadCompanySettings();
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.getSalaryHikesById(this.employeeId);
    }

    this.employeesService
      .getTemplateByType('hikeLetter')
      .subscribe((res: any) => {
        this.hikeLetterContent = res.html;
        this.letterLayout = this.letterLayoutService.parseLayout(
          res.layoutJson,
        );
        this.prepareHikeLetterHtml();
      });
  }

  loadCompanySettings() {
    this.companySettingsService.getCompanySettings().subscribe(
      (response: any) => {
        this.companySettings = response || {};
        this.prepareHikeLetterHtml();
      },
      (error: any) => {
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
  //     this.loading = true; // Show loading indicator
  //     html2pdf()
  //       .from(element)
  //       .save(`${this.employees?.employeeName} Increment Letter.pdf`)
  //       .then(() => {
  //         this.loading = false; // Hide loading indicator after success
  //       })
  //       .catch((error) => {
  //         console.error('PDF generation error:', error);
  //         this.loading = false; // Hide loading indicator on error
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

    const filename = `${this.employees?.employeeName || 'Employee'} Increment Letter.pdf`;

    try {
      const pdf = await this.letterLayoutService.generateLetterPdf(element, {
        filename,
        layout: this.letterLayout,
        companySettings: this.companySettings,
      });

      if (mode === 'download') {
        pdf.save(filename);
        this.toastService.showSuccess('Increment letter downloaded');
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

    const effectiveDate = this.salaryHikes?.hikeDate
      ? this.getOfferLetterDate(this.salaryHikes.hikeDate).toDateString()
      : '';

    return new Promise((resolve) => {
      this.employeesService
        .sendLetterMail({
          letterType: 'hike',
          toEmail,
          employeeName: this.employees?.employeeName || '',
          designation: this.getDesignationName(this.employees?.designation),
          hikeDate: this.salaryHikes?.hikeDate || '',
          effectiveDate,
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
              res?.message || `Increment letter emailed to ${toEmail}`,
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
  getOfferLetterDate(hikeDate: string | Date): Date {
    const date = new Date(hikeDate);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  calculateHikePercentage(oldSalary: number, newSalary: number): string {
    if (oldSalary <= 0) {
      return 'Invalid old salary';
    }
    const hikePercentage = ((newSalary - oldSalary) / oldSalary) * 100;
    return hikePercentage.toFixed(2) + '%';
  }
  getSalaryHikesById(id: string) {
    this.apiLoading = true;
    this.employeesService.getSalaryHikesById(id).subscribe(
      (response) => {
        this.salaryHikes = response;
        if (this.salaryHikes.employeeId) {
          this.getEmployeeById(this.salaryHikes.employeeId);
        }
        this.apiLoading = false;
      },
      (error: any) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      },
    );
  }
  getEmployeeById(id: string) {
    this.apiLoading = true;
    this.employeesService.getEmployeeById(id).subscribe(
      (response) => {
        this.employees = response;
        this.apiLoading = false;

        // 🔥 THIS LINE WAS MISSING
        this.prepareHikeLetterHtml();
      },
      (error) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      },
    );
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
  prepareHikeLetterHtml() {
    if (!this.hikeLetterContent || !this.employees || !this.salaryHikes) return;

    let html = this.letterLayoutService.applyLayout(
      this.hikeLetterContent,
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
      '{{DESIGNATION}}': this.getDesignationName(this.employees.designation),
      '{{HIKE_DATE}}': this.salaryHikes.hikeDate,
      '{{TOTAL_SALARY}}': this.roundToLPA(this.salaryHikes.totalSalary * 12),
      '{{TOTAL_HIKEPERCENTAGE}}': this.calculateHikePercentage(
        this.salaryHikes.basicSalary,
        this.salaryHikes.totalSalary,
      ),
      '{{EFFECTIVE_DATE}}': this.getOfferLetterDate(
        this.salaryHikes.hikeDate,
      ).toDateString(),
      '{{CREATED_BY}}': this.salaryHikes.createdBy,

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

    this.hikeLetterHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  goBack() {
    this.location.back();
  }
}
