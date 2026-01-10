import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { RoutingService } from 'src/app/services/routing-service';
import { ToastService } from 'src/app/services/toast.service';
import { EmployeesService } from '../employees.service';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as html2pdf from 'html2pdf.js';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { CompanySettingsService } from 'src/app/services/company-settings.service';
import { BranchesService } from 'src/app/services/branches.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  version = projectConstantsLocal.VERSION_DESKTOP;
  employees: any = null;
  designations: any = [];
  employeeId: string | null = null;
  offerLetterContent: string | undefined;
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
    private branchesService: BranchesService
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
      this.prepareOfferLetterHtml(); // 🔥 AUTO FILL HERE
    });

  }

  loadCompanySettings() {
    this.companySettingsService.getCompanySettings().subscribe(
      (response: any) => {
        this.companySettings = response || {};
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

  generatePDF() {
  const element = document.getElementById('content');

  if (element) {
    this.loading = true;

    const options = {
      margin: [8, 0, 10, 5], // 🔥 TOP, LEFT, BOTTOM, RIGHT (mm)
      filename: `${this.employees?.employeeName} Offer Letter.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => {
        this.loading = false;
      })
      .catch(err => {
        console.error(err);
        this.loading = false;
      });
  }
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

prepareOfferLetterHtml() {
  if (!this.offerLetterContent || !this.employees) return;

  let html = this.offerLetterContent;

  //  COMPANY LOGO
  const logoUrl = this.companySettings?.companyLogo
    ? 'https://' + this.companySettings.companyLogo
    : '';

  const logoHtml = logoUrl
    ? `<div>
         <img src="${logoUrl}"
              alt="Company Logo"
              style="max-height:80px;max-width:200px;object-fit:contain;" />
       </div>`
    : '';

  // ALL PLACEHOLDERS IN ONE OBJECT
  const replacements: { [key: string]: any } = {
    '{{COMPANY_LOGO}}': logoHtml,

    '{{EMPLOYEE_NAME}}': this.employees.employeeName,
    '{{EMPLOYEE_CITY}}': this.employees.city,
    '{{EMPLOYEE_DISTRICT}}': this.employees.district,
    '{{EMPLOYEE_STATE}}': this.employees.state,
    '{{CREATED_BY}}': this.employees.createdBy,
    '{{JOINING_DATE}}': this.employees.joiningDate,
    '{{DESIGNATION}}': this.getDesignationName(this.employees.designation),
    '{{SALARY}}': this.roundToLPA(this.employees.salary * 12),

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

  //  SINGLE LOOP FOR ALL REPLACEMENTS
  Object.keys(replacements).forEach(key => {
    const value = replacements[key] ?? '';
    html = html.replace(new RegExp(key, 'g'), value);
  });

  this.offerLetterHtml = this.sanitizer.bypassSecurityTrustHtml(html);
}

  getEmployeeById(id: string) {
    this.employeesService.getEmployeeById(id).subscribe(res => {
      this.employees = res;
      this.prepareOfferLetterHtml(); 
    });
  }

}
