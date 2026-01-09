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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as html2pdf from 'html2pdf.js';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private routingService: RoutingService,
    private localStorageService: LocalStorageService,
    private employeesService: EmployeesService,
    private dateTimeProcessor: DateTimeProcessorService,
    private companySettingsService: CompanySettingsService,
    private sanitizer: DomSanitizer
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
      this.prepareHikeLetterHtml();
    });
  }

  loadCompanySettings() {
    this.companySettingsService.getCompanySettings().subscribe(
      (response: any) => {
        this.companySettings = response || {};
      },
      (error: any) => {
        console.error('Error loading company settings:', error);
      }
    );
  }

  roundToLPA(amount: number): string {
    const lakhs = amount / 100000;
    return lakhs.toFixed(2) + ' LPA';
  }

  // generatePDF() {
  //   this.loading = true;
  //   const pdfContent = this.pdfContent.nativeElement;
  //   html2canvas(pdfContent).then((canvas) => {
  //     const imgData = canvas.toDataURL('image/png');
  //     const pdf = new jsPDF('p', 'mm', 'a4');
  //     const imgWidth = 190;
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //     pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  //     pdf.save('incrementletter.pdf');
  //     this.loading = false;
  //   });
  // }

  // generatePDF() {
  //   const element = document.getElementById('content');
  //   if (element) {
  //     html2pdf().from(element).save('IncrementLetter.pdf');
  //   }
  // }

  generatePDF() {
    const element = document.getElementById('content');
    if (element) {
      this.loading = true; // Show loading indicator
      html2pdf()
        .from(element)
        .save(`${this.employees?.employeeName} Increment Letter.pdf`)
        .then(() => {
          this.loading = false; // Hide loading indicator after success
        })
        .catch((error) => {
          console.error('PDF generation error:', error);
          this.loading = false; // Hide loading indicator on error
        });
    }
  }
  getOfferLetterDate(hikeDate: string | Date): Date {
    const date = new Date(hikeDate);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  calculateHikePercentage(oldSalary: number, newSalary: number): string {
    if (oldSalary <= 0) {
      return 'Invalid old salary';
    }
    console.log(oldSalary);
    console.log(newSalary);
    const hikePercentage = ((newSalary - oldSalary) / oldSalary) * 100;
    return hikePercentage.toFixed(2) + '%';
  }
  getSalaryHikesById(id: string) {
    this.apiLoading = true;
    this.employeesService.getSalaryHikesById(id).subscribe(
      (response) => {
        this.salaryHikes = response;
        console.log('Salary Hikes', this.salaryHikes);
        if (this.salaryHikes.employeeId) {
          this.getEmployeeById(this.salaryHikes.employeeId);
        }
        this.apiLoading = false;
      },
      (error: any) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      }
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
    }
  );
}
  // getEmployeeById(id: string) {
  //   this.apiLoading = true;
  //   this.employeesService.getEmployeeById(id).subscribe(
  //     (response) => {
  //       this.employees = response;
  //       console.log('Employees', this.employees);
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

  prepareHikeLetterHtml() {
  if (!this.hikeLetterContent || !this.employees || !this.salaryHikes) return;

  let html = this.hikeLetterContent;

  const logo = this.companySettings?.companyLogo
    ? `<img src="https://${this.companySettings.companyLogo}" style="max-height:80px;" />`
    : '';

  html = html.replace(/{{COMPANY_LOGO}}/g, logo);
  html = html.replace(/{{EMPLOYEE_NAME}}/g, this.employees.employeeName);
  html = html.replace(/{{DESIGNATION}}/g, this.getDesignationName(this.employees.designation));
  html = html.replace(/{{HIKE_DATE}}/g, this.salaryHikes.hikeDate);
  html = html.replace(/{{TOTAL_SALARY}}/g, this.roundToLPA(this.salaryHikes.totalSalary * 12));
   html = html.replace(
    /{{TOTAL_HIKEPERCENTAGE}}/g,
    this.calculateHikePercentage(
      this.salaryHikes.basicSalary,
      this.salaryHikes.totalSalary
    )
  );
  html = html.replace(/{{EFFECTIVE_DATE}}/g, this.getOfferLetterDate(this.salaryHikes.hikeDate).toDateString());
  html = html.replace(/{{CREATED_BY}}/g, this.salaryHikes.createdBy);

  html = html.replace(/{{COMPANY_NAME}}/g, this.companySettings.companyName || '');
  html = html.replace(/{{COMPANY_PHONE}}/g, this.companySettings.companyPhone || '');
  html = html.replace(/{{COMPANY_ADDRESS}}/g, this.companySettings.companyAddress || '');
  html = html.replace(/{{COMPANY_CITY}}/g, this.companySettings.companyCity || '');
  html = html.replace(/{{COMPANY_STATE}}/g, this.companySettings.companyState || '');
  html = html.replace(/{{COMPANY_PINCODE}}/g, this.companySettings.companyPincode || '');

  this.hikeLetterHtml = this.sanitizer.bypassSecurityTrustHtml(html);
}

  goBack() {
    this.location.back();
  }
}
