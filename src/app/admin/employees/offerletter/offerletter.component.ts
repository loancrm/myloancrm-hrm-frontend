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

  // generatePDF() {
  //   this.loading = true;
  //   const pageElements = document.querySelectorAll('.page');
  //   const pdf = new jsPDF('p', 'mm', 'a4');
  //   const imgWidth = 190;
  //   const pageHeight = 297;
  //   const addPagesToPDF = async () => {
  //     for (let i = 0; i < pageElements.length; i++) {
  //       const pageElement = pageElements[i];
  //       await html2canvas(pageElement as HTMLElement).then((canvas) => {
  //         const imgData = canvas.toDataURL('image/png');
  //         const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //         pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  //         if (i < pageElements.length - 1) {
  //           pdf.addPage();
  //         }
  //       });
  //     }
  //   };
  //   addPagesToPDF()
  //     .then(() => {
  //       pdf.save('Offerletter.pdf');
  //       this.loading = false;
  //     })
  //     .catch((error) => {
  //       console.error('Error generating PDF:', error);
  //       this.loading = false;
  //     });
  // }

  //  generatePDF() {
  //     const element = document.getElementById('content');
  //     if (element) {
  //       html2pdf().from(element).save('IncrementLetter.pdf');
  //     }
  //   }
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

  // generatePDF() {
  //   const element = document.getElementById('content');
  //   if (element) {
  //     this.loading = true; // Show loading indicator
      
  //     html2pdf()
  //       .from(element)
  //       .save(`${this.employees?.employeeName} Offer Letter.pdf`)
  //       .then(() => {
  //         this.loading = false; // Hide loading indicator after success
  //       })
  //       .catch((error) => {
  //         console.error('PDF generation error:', error);
  //         this.loading = false; // Hide loading indicator on error
  //       });
  //   }
  // }
  getOfferLetterDate(joiningDate: string): Date {
    const date = new Date(joiningDate);
    date.setDate(date.getDate() - 2);
    return date;
  }
  // getEmployeeById(id: string) {
  //   this.loading = true;
  //   this.employeesService.getEmployeeById(id).subscribe(
  //     (response) => {
  //       this.employees = response;
  //       console.log('Employees', this.employees);
  //       this.loading = false;
  //     },
  //     (error: any) => {
  //       this.loading = false;
  //       this.toastService.showError(error);
  //     }
  //   );
  // }

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

  // =======================
// 🔥 COMPANY LOGO REPLACE
// =======================
const logoUrl = this.companySettings?.companyLogo
  ? 'https://' + this.companySettings.companyLogo
  : '';

if (logoUrl) {
  html = html.replace(
    /{{COMPANY_LOGO}}/g,
    `<div>
       <img src="${logoUrl}"
            alt="Company Logo"
            style="max-height:80px;max-width:200px;object-fit:contain;" />
     </div>`
  );
} else {
  html = html.replace(/{{COMPANY_LOGO}}/g, '');
}

  html = html.replace(/{{EMPLOYEE_NAME}}/g, this.employees.employeeName);
  html = html.replace(/{{EMPLOYEE_CITY}}/g, this.employees.city);
  html = html.replace(/{{EMPLOYEE_DISTRICT}}/g, this.employees.district);
  html = html.replace(/{{EMPLOYEE_STATE}}/g, this.employees.state);
  html = html.replace(/{{CREATED_BY}}/g, this.employees.createdBy);
  html = html.replace(/{{JOINING_DATE}}/g, this.employees.joiningDate);
  html = html.replace(/{{DESIGNATION}}/g, this.getDesignationName(this.employees.designation));
  html = html.replace(/{{SALARY}}/g, this.roundToLPA(this.employees.salary * 12));

  html = html.replace(/{{COMPANY_NAME}}/g, this.companySettings.companyName || '');
  html = html.replace(/{{HR_EMAIL}}/g, this.companySettings.hrEmail || '');
  html = html.replace(/{{ACCOUNT_EMAIL}}/g, this.companySettings.accountEmail || '');
  html = html.replace(/{{COMPANY_PHONE}}/g, this.companySettings.companyPhone || '');
  html = html.replace(/{{COMPANY_ADDRESS}}/g, this.companySettings.companyAddress || '');
  html = html.replace(/{{COMPANY_CITY}}/g, this.companySettings.companyCity || '');
  html = html.replace(/{{COMPANY_STATE}}/g, this.companySettings.companyState || '');
  html = html.replace(/{{COMPANY_PINCODE}}/g, this.companySettings.companyPincode || '');
  html = html.replace(/{{COMPANY_WEBSITE}}/g, this.companySettings.companyWebsite || '');

  // this.offerLetterHtml = html;
  this.offerLetterHtml = this.sanitizer.bypassSecurityTrustHtml(html);

  console.log('Prepared Offer Letter HTML:', this.offerLetterHtml);
  }
  getEmployeeById(id: string) {
    this.employeesService.getEmployeeById(id).subscribe(res => {
      this.employees = res;
      this.prepareOfferLetterHtml(); // 🔥 AUTO FILL HERE
    });
  }

}
