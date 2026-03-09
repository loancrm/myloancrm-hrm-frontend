import { Component, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { RoutingService } from 'src/app/services/routing-service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { EmployeesService } from '../employees.service';
import * as html2pdf from 'html2pdf.js';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
import { CompanySettingsService } from 'src/app/services/company-settings.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private sanitizer: DomSanitizer,
    private routingService: RoutingService,
    private localStorageService: LocalStorageService,
    private employeesService: EmployeesService,
    private dateTimeProcessor: DateTimeProcessorService,
    private companySettingsService: CompanySettingsService
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
      this.prepareRelievingLetterHtml();
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

  generatePDF() {
  const element = document.getElementById('content');
  if (!element) return;

  // this.loading = true;
  this.downloadingPDF = true;

  const images = element.getElementsByTagName('img');
  const imagePromises: Promise<void>[] = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i] as HTMLImageElement;

    if (img.src && !img.complete) {
      imagePromises.push(
        new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          setTimeout(() => resolve(), 5000);
        })
      );
    }
  }

  Promise.all(imagePromises).then(() => {

    const options = {
      margin: [8, 0, 10, 5],
      filename: `${this.employees?.employeeName} Relieving Letter.pdf`,
      image: { type: 'jpeg', quality: 0.98 },

      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 15000
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
        // this.loading = false;
        this.downloadingPDF = false;
      })
      .catch((err) => {
        console.error(err);
        // this.loading = false;
        this.downloadingPDF = false;
      });

  });
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

prepareRelievingLetterHtml() {
  if (!this.relievingLetterContent || !this.employees) return;

  let html = this.relievingLetterContent;

  // const logoUrl = this.companySettings?.companyLogo
  //   ? 'https://' + this.companySettings.companyLogo
  //   : '';
  const logoUrl = this.companySettings?.companyLogo
  ? (this.companySettings.companyLogo.startsWith('http')
      ? this.companySettings.companyLogo
      : 'https://' + this.companySettings.companyLogo)
  : '';

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}"
             style="max-height:80px;max-width:200px;object-fit:contain;" />`
    : '';

  // ALL PLACEHOLDERS IN ONE OBJECT
  const replacements: { [key: string]: any } = {
    '{{COMPANY_LOGO}}': logoHtml,

    '{{EMPLOYEE_NAME}}': this.employees.employeeName,
    '{{EMPLOYEE_CITY}}': this.employees.employeeCity,
    '{{DESIGNATION}}': this.getDesignationName(this.employees.designation),
    '{{JOINING_DATE}}': this.employees.joiningDate,
    '{{RELIEVING_DATE}}':
      this.employees.resignedDate || this.employees.terminationDate,
    '{{CREATED_BY}}': this.employees.createdBy,

    '{{COMPANY_NAME}}': this.companySettings.companyName || '',
    '{{COMPANY_PHONE}}': this.companySettings.companyPhone || '',
    '{{COMPANY_ADDRESS}}': this.companySettings.companyAddress || '',
    '{{COMPANY_CITY}}': this.companySettings.companyCity || '',
    '{{COMPANY_STATE}}': this.companySettings.companyState || '',
    '{{COMPANY_PINCODE}}': this.companySettings.companyPincode || ''
  };

  // SINGLE LOOP FOR ALL REPLACEMENTS
  Object.keys(replacements).forEach(key => {
    const value = replacements[key] ?? '';
    html = html.replace(new RegExp(key, 'g'), value);
  });

  this.relievingLetterHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  console.log('Prepared Relieving Letter HTML:', this.relievingLetterHtml);
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
    }
  );
}


  goBack() {
    this.location.back();
  }
}
