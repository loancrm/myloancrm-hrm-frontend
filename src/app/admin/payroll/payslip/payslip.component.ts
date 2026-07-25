import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { EmployeesService } from '../../employees/employees.service';
import { Location } from '@angular/common';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as html2pdf from 'html2pdf.js';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { CompanySettingsService } from 'src/app/services/company-settings.service';
import {
  OfficePayrollPolicy,
  OfficePayrollPolicyService,
} from 'src/app/services/office-payroll-policy.service';
@Component({
  selector: 'app-payslip',
  templateUrl: './payslip.component.html',
  styleUrls: ['./payslip.component.scss'],
})
export class PayslipComponent {
  breadCrumbItems: any = [];
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;
  payroll: any = [];
  moment: any;
  designations: any = [];
  payslipId: string | null = null;
  version = projectConstantsLocal.VERSION_DESKTOP;
  loading: boolean = false;
  emailing: boolean = false;
  amountinwords: string = 'Sixty Thousand Rupees Only';
  currentYear: number;
  apiLoading: any;
  companySettings: any = {};
  officePolicy: OfficePayrollPolicy;
  payrollPeriodLabel: string = '';
  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private toastService: ToastService,
    private employeesService: EmployeesService,
    private dateTimeProcessor: DateTimeProcessorService,
    private companySettingsService: CompanySettingsService,
    private officePayrollPolicyService: OfficePayrollPolicyService,
  ) {
    const usertype = localStorageService.getItemFromLocalStorage('userType');
    this.moment = this.dateTimeProcessor.getMoment();
    this.officePolicy = this.officePayrollPolicyService.defaults;
    this.breadCrumbItems = [
      {
        icon: 'fa fa-house',
        label: ' Dashboard',
        routerLink: `/${usertype}/dashboard`,
        queryParams: { v: this.version },
      },
      {
        label: 'Payroll',
        routerLink: `/${usertype}/payroll`,
        queryParams: { v: this.version },
      },
      { label: 'Payslip' },
    ];
    this.getdesignations();
  }

  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
    this.loadCompanySettings();
    this.payslipId = this.route.snapshot.paramMap.get('id');
    if (this.payslipId) {
      this.getPayrollById(this.payslipId);
    }
  }

  loadCompanySettings() {
    this.companySettingsService.getCompanySettings().subscribe(
      (response: any) => {
        this.companySettings = response || {};
        this.officePolicy = this.officePayrollPolicyService.normalize(
          response || {},
        );
        this.updatePayrollPeriodLabel();
      },
      (error: any) => {
        console.error('Error loading company settings:', error);
      },
    );
  }

  updatePayrollPeriodLabel() {
    if (!this.payroll?.payrollMonth) {
      this.payrollPeriodLabel = '';
      return;
    }
    const month = this.moment(this.payroll.payrollMonth, 'YYYY-MM').format(
      'YYYY-MM',
    );
    this.payrollPeriodLabel = this.officePayrollPolicyService.formatPeriodLabel(
      this.moment,
      month,
      this.officePolicy,
    );
  }

  get payslipFilename(): string {
    return `${this.payroll?.employeeName || 'Employee'} ${this.getMonthNameAndYear(this.payroll?.payrollMonth)} Payslip.pdf`;
  }

  generatePDF() {
    this.downloadPayslip();
  }

  downloadPayslip() {
    this.loading = true;
    this.buildPayslipPdf()
      .then((pdf) => {
        pdf.save(this.payslipFilename);
        this.loading = false;
      })
      .catch((err) => {
        console.error(err);
        this.loading = false;
        this.toastService.showError('Failed to generate payslip PDF');
      });
  }

  emailPayslip() {
    const toEmail = (this.payroll?.emailAddress || '').trim();
    if (!toEmail) {
      this.toastService.showError(
        'Employee email is missing. Update the employee profile to email the payslip.',
      );
      return;
    }

    this.emailing = true;
    this.buildPayslipPdf()
      .then((pdf) => this.sendPayslipMail(pdf, toEmail))
      .catch((err) => {
        console.error(err);
        this.toastService.showError('Failed to generate payslip PDF for email');
      })
      .then(() => {
        this.emailing = false;
      });
  }

  private buildPayslipPdf(): Promise<jsPDF> {
    const pdfContent = this.pdfContent.nativeElement;
    return html2canvas(pdfContent, {
      useCORS: true,
      allowTaint: false,
      scale: 1.5,
      backgroundColor: '#ffffff',
    }).then((canvas) => {
      // JPEG keeps the email payload small; PNG at scale 2 easily
      // exceeds Express's default body limit and triggers PayloadTooLarge.
      const imgData = canvas.toDataURL('image/jpeg', 0.82);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Fit on one page when possible; otherwise scale down slightly.
      const maxHeight = pageHeight - margin * 2;
      if (imgHeight > maxHeight) {
        const scale = maxHeight / imgHeight;
        imgHeight = maxHeight;
        const scaledWidth = imgWidth * scale;
        pdf.addImage(
          imgData,
          'JPEG',
          margin + (imgWidth - scaledWidth) / 2,
          margin,
          scaledWidth,
          imgHeight,
        );
      } else {
        pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
      }
      return pdf;
    });
  }

  private sendPayslipMail(pdf: jsPDF, toEmail: string): Promise<void> {
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

    const payPeriod =
      this.payrollPeriodLabel ||
      this.getMonthNameAndYear(this.payroll?.payrollMonth);

    return new Promise<void>((resolve) => {
      this.employeesService
        .sendLetterMail({
          letterType: 'payslip',
          toEmail,
          employeeName: this.payroll?.employeeName || '',
          designation:
            this.payroll?.designationName ||
            this.getDesignationName(this.payroll?.designation),
          payPeriod,
          netPay:
            this.payroll?.netSalary != null
              ? `Rs. ${this.payroll.netSalary}`
              : '',
          companyName: this.companySettings?.companyName || '',
          hrEmail: this.companySettings?.hrEmail || '',
          companyPhone: this.companySettings?.companyPhone || '',
          companyAddress: this.companySettings?.companyAddress || '',
          companyCity: this.companySettings?.companyCity || '',
          filename: this.payslipFilename,
          pdfBase64,
        })
        .subscribe(
          (res: any) => {
            this.toastService.showSuccess(
              res?.message || `Payslip emailed to ${toEmail}`,
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

  // generatePDF() {
  //   const print = this.pdfContent?.nativeElement;
  //   const printWindow = window.open('', '_blank');
  //   if (printWindow) {
  //     // Write the document structure first
  //     printWindow.document.write('<html>');
  //     printWindow.document.write('<head><title>Print Report</title>');
  //     printWindow?.document.write(
  //       `<style>${this.reUsableStylesForReportPrint}</style>`
  //     );
  //     printWindow.document.write('</head><body>');

  //     // Check if print content exists and write it
  //     if (print) {
  //       printWindow.document.write(print.innerHTML);
  //     }
  //     printWindow.document.write('</body></html>');

  //     // Close the document to indicate that writing is done
  //     printWindow.document.close();

  //     // Ensure the window has time to render the content
  //     printWindow.onload = () => {
  //       printWindow.focus(); // Focus on the print window to ensure the print dialog can open
  //       printWindow.print(); // Trigger the print dialog
  //       printWindow.close(); // Close the print window after printing
  //     };
  //   }
  // }

  // generatePDF() {
  //   const print = this.pdfContent?.nativeElement;
  //   const printWindow = window.open('', '_blank');
  //   printWindow?.document.write('<html>');
  //   printWindow?.document.write(
  //     `<style>${this.reUsableStylesForReportPrint}</style>`
  //   );
  //   printWindow?.document.write('<head><title></title></head><body>');
  //   printWindow?.document.write(print.innerHTML);
  //   printWindow?.document.write('</body></html>');
  //   printWindow?.moveTo(0, 0);
  //   printWindow?.document.close();
  //   printWindow?.print();
  //   printWindow?.close();
  // }

  // generatePDF() {
  //   const element = document.getElementById('content');
  //   if (element) {
  //     html2pdf().from(element).save('download.pdf');
  //   }
  // }
  getPayrollById(id: string) {
    this.apiLoading = true;
    this.employeesService.getPayrollById(id).subscribe(
      (payrollresponse: any) => {
        this.employeesService
          .getEmployeeById(payrollresponse.employeeId)
          .subscribe(
            (employeeResponse: any) => {
              this.payroll = this.mergePayrollWithEmployee(
                payrollresponse,
                employeeResponse,
              );
              this.updatePayrollPeriodLabel();
              this.apiLoading = false;
            },
            (error: any) => {
              this.apiLoading = false;
              this.toastService.showError(error);
            },
          );
      },
      (error: any) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      },
    );
  }

  mergePayrollWithEmployee(payroll: any, employee: any): any {
    if (employee && payroll) {
      return {
        ...payroll,
        designationName: employee.designationName,
        designation: employee.designation,
        emailAddress: employee.emailAddress || payroll.emailAddress || '',
      };
    }
    return payroll;
  }

  getMonthNameAndYear(dateString: string): string {
    const date = this.moment(dateString, 'YYYY-MM');
    return date.format('MMMM YYYY');
  }

  convertAmountToWords(amount: number): string {
    const ones = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];
    const tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];
    const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
    if (amount === 0) return 'Zero';
    const chunkify = (n: number): number[] => {
      const chunks: number[] = [];
      while (n > 0) {
        chunks.push(n % 1000);
        n = Math.floor(n / 1000);
      }
      return chunks;
    };
    const convertChunk = (chunk: number): string => {
      let words = '';
      if (chunk >= 100) {
        words += ones[Math.floor(chunk / 100)] + ' Hundred ';
        chunk %= 100;
      }
      if (chunk >= 20) {
        words += tens[Math.floor(chunk / 10)] + ' ';
        chunk %= 10;
      }
      if (chunk > 0) {
        words += ones[chunk] + ' ';
      }
      return words.trim();
    };
    const chunks = chunkify(amount);
    let words = '';
    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i] > 0) {
        words = convertChunk(chunks[i]) + ' ' + scales[i] + ' ' + words;
      }
    }
    return words.trim();
  }
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
  goBack() {
    this.location.back();
  }
}
