import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { RoutingService } from 'src/app/services/routing-service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ToastService } from 'src/app/services/toast.service';
import { EmployeesService } from '../employees/employees.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss'],
})
export class PayrollComponent {
  breadCrumbItems: any = [];
  currentTableEvent: any;
  filterConfig: any[] = [];
  appliedFilter: {};
  selectedPayrollDetails: any = null;
  isDialogVisible = false;
  selectedEmployee: any;
  loading: any;
  apiLoading: any;
  payroll: any = [];
  holidays: any = [];
  totalPayrollCount: any = 0;
  employees: any = [];
  searchFilter: any = {};
  version = projectConstantsLocal.VERSION_DESKTOP;
  moment: any;
  selectedMonth: Date;
  displayMonth: Date;
  capabilities: any;
  userDetails: any;
  currentYear: number;
  countsAnalytics: any[] = [];
  totalSalary: any = 0;
  totalDeductions: any = 0;
  totalNetSalary: any = 0;
  payrollEmployees: any = 0;
  constructor(
    private location: Location,
    private confirmationService: ConfirmationService,
    private routingService: RoutingService,
    private toastService: ToastService,
    private employeesService: EmployeesService,
    private localStorageService: LocalStorageService,
    private dateTimeProcessor: DateTimeProcessorService
  ) {
    // const usertype = localStorage.getItem('userType');
    const usertype = localStorageService.getItemFromLocalStorage('userType');
    this.moment = this.dateTimeProcessor.getMoment();
    this.selectedMonth = this.moment(new Date())
      .subtract(1, 'month')
      .format('YYYY-MM');
    this.displayMonth = this.moment(new Date())
      .subtract(1, 'month')
      .format('MMMM YYYY');
    this.breadCrumbItems = [
      {
        icon: 'fa fa-house',
        label: '  Dashboard',
        routerLink: `/${usertype}/dashboard`,
        queryParams: { v: this.version },
      },
      { label: 'Payroll' },
    ];
  }
  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
    let userDetails =
      this.localStorageService.getItemFromLocalStorage('userDetails');
    this.userDetails = userDetails.user;
    this.capabilities = this.employeesService.getUserRbac();
    console.log('capabilities', this.capabilities);
    if (this.capabilities.adminPayroll) {
      this.getEmployees();
      this.getHolidays();
      this.getEmployeesStatusCount();
      this.updateCountsAnalytics();
    }
    this.setFilterConfig();
    const storedStatus =
      this.localStorageService.getItemFromLocalStorage('selectedEmployee');
    if (storedStatus) {
      this.selectedEmployee = storedStatus;
    }
    const storedMonth =
      this.localStorageService.getItemFromLocalStorage('payrollMonth');
    if (storedMonth) {
      this.selectedMonth = storedMonth;
      this.displayMonth = this.moment(this.selectedMonth).format('MMMM YYYY');
    }
    const storedAppliedFilter =
      this.localStorageService.getItemFromLocalStorage('payrollAppliedFilter');
    if (storedAppliedFilter) {
      this.appliedFilter = storedAppliedFilter;
    }
  }

  updateCountsAnalytics() {
    this.countsAnalytics = [
      {
        name: 'user', // Represents total employees in payroll
        displayName: 'Total Payroll Employees',
        count: `${this.payrollEmployees} `, // Assuming you have a variable for total employees
        textcolor: '#3498DB', // Blue to represent a professional/business environment
        backgroundcolor: '#D9EAF7',
      },
      {
        name: 'sack-dollar', // Represents total gross salary (big earnings)
        displayName: 'Total Gross Salary',
        count: `Rs. ${this.totalSalary} ( ${this.convertToReadableFormat(
          this.totalSalary
        )} )`,
        textcolor: '#F39C12', // Warm golden yellow for money representation
        backgroundcolor: '#FEF5E7',
      },
      {
        name: 'file-invoice-dollar', // Represents deductions (taxes, deductions)
        displayName: 'Total Deductions',
        count: `Rs. ${this.totalDeductions} ( ${this.convertToReadableFormat(
          this.totalDeductions
        )} )`,
        textcolor: '#E74C3C', // Red for deductions (represents money going out)
        backgroundcolor: '#FDEDEC',
      },
      {
        name: 'piggy-bank', // Represents net salary (final savings or payout)
        displayName: 'Total Net Salary',
        count: `Rs. ${this.totalNetSalary} ( ${this.convertToReadableFormat(
          this.totalNetSalary
        )} )`,
        textcolor: '#27AE60', // Green to indicate received/savings amount
        backgroundcolor: '#E9F7EF',
      },
    ];
  }

  convertToReadableFormat(amount: number): string {
    if (amount >= 10000000) {
      // Convert to Crores
      return (
        (amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 2) + ' Cr'
      );
    } else if (amount >= 100000) {
      // Convert to Lakhs
      return (amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 2) + ' L';
    } else if (amount >= 1000) {
      // Convert to Thousands
      return (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1) + ' K';
    } else {
      // Show the exact number
      return amount.toString();
    }
  }

  onDateChange(event: any) {
    this.selectedMonth = this.moment(event).format('YYYY-MM');
    this.displayMonth = this.moment(event).format('MMMM YYYY');
    this.localStorageService.setItemOnLocalStorage(
      'payrollMonth',
      this.selectedMonth
    );
    this.loadPayslips(this.currentTableEvent);
    this.getEmployeesStatusCount();
  }
  getEmployees(filter = {}) {
    this.loading = true;
    filter['employeeInternalStatus-eq'] = 1;
    filter['sort'] = 'joiningDate,asc';
    console.log(filter);
    this.employeesService.getEmployees(filter).subscribe(
      (response: any) => {
        this.employees = [{ employeeName: 'All' }, ...response];
        this.employees = this.employees.map((emp) => ({
          ...emp,
          employeeName: emp.employeeName
            .split(' ')
            .map((word) => {
              if (word.includes('.')) {
                return word
                  .split('.')
                  .map(
                    (part) =>
                      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
                  )
                  .join('.');
              }
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' '),
        }));
        console.log('employees', this.employees);
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  getEmployeesStatusCount(filter = {}) {
    filter['payrollMonth-eq'] = this.selectedMonth;
    this.employeesService.getPayroll(filter).subscribe(
      (response: any) => {
        // Ensure response is treated as an array
        console.log(response);
        this.totalSalary = response.reduce((sum, emp) => sum + emp.salary, 0);
        const deductions = response.reduce(
          (sum, emp) => sum + emp.deductions,
          0
        );
        const professionalTax = response.reduce(
          (sum, emp) => sum + emp.professionalTax,
          0
        );
        this.totalDeductions = deductions + professionalTax;
        this.totalNetSalary = response.reduce(
          (sum, emp) => sum + emp.netSalary,
          0
        );
        this.payrollEmployees = response.length;
        console.log('Total Salary:', this.totalSalary);
        console.log('Total Deductions:', this.totalDeductions);
        console.log('Total Net Salary:', this.totalNetSalary);
        console.log('Total Payroll Employees:', this.payrollEmployees);

        this.updateCountsAnalytics();
      },
      (error: any) => {
        this.toastService.showError(error);
      }
    );
  }
  actionItems(payslip: any): MenuItem[] {
    const menuItems: any = [{ label: 'Actions', items: [] }];
    menuItems[0].items.push({
      label: 'Payroll Details',
      icon: 'fa fa-eye',
      command: () => this.showPayrollDetails(payslip),
    });
    if (this.capabilities.adminPayroll) {
      menuItems[0].items.push({
        label: 'Update',
        icon: 'fa fa-pen-to-square',
        command: () => this.updateUser(payslip.payslipId),
      });
    }
    if (this.capabilities.delete) {
      menuItems[0].items.push({
        label: 'Delete',
        icon: 'fa fa-trash',
        command: () => this.confirmDelete(payslip),
      });
    }
    return menuItems;
  }

  showPayrollDetails(user: any): void {
    this.selectedPayrollDetails = user;
    this.isDialogVisible = true;
  }
  clearDialog(): void {
    this.selectedPayrollDetails = null;
    this.isDialogVisible = false;
  }

  statusChange(event: any): void {
    this.localStorageService.setItemOnLocalStorage(
      'selectedEmployee',
      event.value
    );
    this.loadPayslips(this.currentTableEvent);
  }
  setFilterConfig() {
    this.filterConfig = [
      {
        header: 'Payslip Id',
        data: [
          {
            field: 'payslipId',
            title: 'Payslip Id',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      // {
      //   header: 'Employee Id',
      //   data: [
      //     {
      //       field: 'employeeId',
      //       title: 'Employee Id',
      //       type: 'text',
      //       filterType: 'like',
      //     },
      //   ],
      // },

      ...(this.capabilities.employeePayroll
        ? [
            {
              header: 'Payroll Month',
              data: [
                {
                  field: 'payrollMonth',
                  title: 'Payroll Month',
                  type: 'month',
                  filterType: 'eq',
                },
              ],
            },
          ]
        : []),

      ...(this.capabilities.adminPayroll
        ? [
            {
              header: 'Employee Id',
              data: [
                {
                  field: 'employeeId',
                  title: 'Employee Id',
                  type: 'text',
                  filterType: 'like',
                },
              ],
            },
            {
              header: 'Employee Name',
              data: [
                {
                  field: 'employeeName',
                  title: 'Employee Name',
                  type: 'text',
                  filterType: 'like',
                },
              ],
            },
            {
              header: 'Custom Employee Id',
              data: [
                {
                  field: 'customEmployeeId',
                  title: 'Custom Employee Id',
                  type: 'text',
                  filterType: 'like',
                },
              ],
            },
            {
              header: 'Joining Date',
              data: [
                {
                  field: 'joiningDate',
                  title: 'Joining Date ',
                  type: 'date',
                  filterType: 'like',
                },
              ],
            },
          ]
        : []),
      // {
      //   header: 'Custom Employee Id',
      //   data: [
      //     {
      //       field: 'customEmployeeId',
      //       title: 'Custom Employee Id',
      //       type: 'text',
      //       filterType: 'like',
      //     },
      //   ],
      // },
      // {
      //   header: 'Joining Date',
      //   data: [
      //     {
      //       field: 'joiningDate',
      //       title: 'Joining Date ',
      //       type: 'date',
      //       filterType: 'like',
      //     },
      //   ],
      // },
      {
        header: 'Working Days',
        data: [
          {
            field: 'workingDays',
            title: 'Working Days',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Present Days',
        data: [
          {
            field: 'presentDays',
            title: 'Present Days',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Paid Days',
        data: [
          {
            field: 'paidDays',
            title: 'Paid Days',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Absent Days',
        data: [
          {
            field: 'absentDays',
            title: 'Absent Days',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Total Absent Days',
        data: [
          {
            field: 'totalAbsentDays',
            title: 'Total Absent Days',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Double LOP Days',
        data: [
          {
            field: 'doubleLopDays',
            title: 'Double LOP Days',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Late LOP Days',
        data: [
          {
            field: 'lateLopDays',
            title: 'Late LOP Days',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Total Deducted Days',
        data: [
          {
            field: 'totalDeductedDays',
            title: 'Total Deducted Days',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Salary',
        data: [
          {
            field: 'salary',
            title: 'Salary',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Day Salary',
        data: [
          {
            field: 'daySalary',
            title: 'Day Salary',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Net Salary Without Double LOP',
        data: [
          {
            field: 'netSalaryWithoutDoubleLop',
            title: 'Net Salary Without Double LOP',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Net Salary With Double LOP',
        data: [
          {
            field: 'netSalaryWithDoubleLop',
            title: 'Net Salary With Double LOP',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      {
        header: 'Petrol Expenses',
        data: [
          {
            field: 'petrolExpenses',
            title: 'Petrol Expenses',
            type: 'text',
            filterType: 'like',
          },
        ],
      },
      // {
      //   header: 'Account Number',
      //   data: [
      //     {
      //       field: 'accountNumber',
      //       title: 'Account Number',
      //       type: 'text',
      //       filterType: 'like',
      //     },
      //   ],
      // },
      // {
      //   header: 'IFSC Code',
      //   data: [
      //     {
      //       field: 'ifscCode',
      //       title: 'IFSC Code',
      //       type: 'text',
      //       filterType: 'like',
      //     },
      //   ],
      // },
      // {
      //   header: 'Bank Branch',
      //   data: [
      //     {
      //       field: 'bankBranch',
      //       title: 'Bank Branch',
      //       type: 'text',
      //       filterType: 'like',
      //     },
      //   ],
      // },
      ...(this.capabilities.adminPayroll
        ? [
            {
              header: 'Account Number',
              data: [
                {
                  field: 'accountNumber',
                  title: 'Account Number',
                  type: 'text',
                  filterType: 'like',
                },
              ],
            },
            {
              header: 'IFSC Code',
              data: [
                {
                  field: 'ifscCode',
                  title: 'IFSC Code',
                  type: 'text',
                  filterType: 'like',
                },
              ],
            },
            {
              header: 'Bank Branch',
              data: [
                {
                  field: 'bankBranch',
                  title: 'Bank Branch',
                  type: 'text',
                  filterType: 'like',
                },
              ],
            },
          ]
        : []),
      {
        header: 'Created Date Range',
        data: [
          {
            field: 'createdOn',
            title: 'From',
            type: 'date',
            filterType: 'gte',
          },
          { field: 'createdOn', title: 'To', type: 'date', filterType: 'lte' },
        ],
      },
      {
        header: 'created On  ',
        data: [
          {
            field: 'createdOn',
            title: 'Date ',
            type: 'date',
            filterType: 'like',
          },
        ],
      },
    ];
  }
  loadPayslips(event) {
    this.currentTableEvent = event;
    let api_filter = this.employeesService.setFiltersFromPrimeTable(event);
    api_filter = Object.assign(
      {},
      api_filter,
      this.searchFilter,
      this.appliedFilter
    );
    if (this.selectedEmployee) {
      if (this.selectedEmployee && this.selectedEmployee.employeeName) {
        if (this.selectedEmployee.employeeName != 'All') {
          api_filter['employeeId-eq'] = this.selectedEmployee.employeeId;
        } else {
        }
      }
    }
    if (this.capabilities.employeePayroll) {
      api_filter['employeeId-eq'] = this.userDetails.employeeId;
    } else {
      api_filter['payrollMonth-eq'] = this.selectedMonth;
    }
    console.log(api_filter);
    if (api_filter) {
      this.getPayrollCount(api_filter);
      this.getPayroll(api_filter);
    }
  }

  getPayrollCount(filter = {}) {
    this.employeesService.getPayrollCount(filter).subscribe(
      (response) => {
        this.totalPayrollCount = response;
      },
      (error: any) => {
        this.toastService.showError(error);
      }
    );
  }

  getPayroll(filter = {}) {
    this.apiLoading = true;
    this.employeesService.getPayroll(filter).subscribe(
      (payrollResponse: any) => {
        this.employeesService.getEmployees().subscribe(
          (employeeResponse: any) => {
            this.payroll = this.mergePayrollWithEmployees(
              payrollResponse,
              employeeResponse
            );
            console.log('Merged Payroll Data:', this.payroll);
            this.apiLoading = false;
          },
          (error: any) => {
            this.apiLoading = false;
            this.toastService.showError(error);
          }
        );
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  mergePayrollWithEmployees(payroll: any[], employees: any[]): any[] {
    return payroll.map((p) => {
      const employee = employees.find((e) => e.employeeId === p.employeeId);
      return employee ? { ...p, passPhoto: employee.passPhoto } : p;
    });
  }

  confirmCalculate() {
    this.confirmationService.confirm({
      // message: 'Are you sure you want to delete this Employee?',
      message: `Are you sure you want to Calculate Payroll for Active Employees ?
              `,
      header: 'Confirm Payroll Calculation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.calculatePayrollForAllEmployees();
      },
    });
  }

  calculatePayrollForAllEmployees() {
    this.loading = true;
    const payrollMonth = this.moment().subtract(1, 'month').format('YYYY-MM');
    const workingDays = this.getWorkingDays(payrollMonth);
    const payroll = new Date(this.moment(payrollMonth, 'YYYY-MM').toDate());

    this.employeesService
      .getEmployees({ 'employeeInternalStatus-eq': 1 })
      .subscribe(
        (response: any) => {
          const employees = response;
          if (!employees || employees.length === 0) {
            this.toastService.showError('No active employees found.');
            this.loading = false;
            return;
          }

          // Fetch salary hikes for all employees first
          this.getSalaryHikes({ 'hikeInternalStatus-eq': 1 }).subscribe(
            (salaryHikes: any) => {
              // Prepare attendance requests
              const attendanceRequests = employees.map((employee) =>
                this.employeesService.getAttendance()
              );

              forkJoin(attendanceRequests).subscribe(
                (attendanceResponses: any) => {
                  let payrollRequests: any = [];

                  employees.forEach((employee, index) => {
                    const attendance = attendanceResponses[index];
                    const filteredAttendance = attendance.filter((record) => {
                      const attendanceDate = new Date(record.attendanceDate);
                      return (
                        attendanceDate.getMonth() === payroll.getMonth() &&
                        attendanceDate.getFullYear() === payroll.getFullYear()
                      );
                    });
                    // Calculate Present & Late Days
                    const presentDays = filteredAttendance.reduce(
                      (count, record) => {
                        const employeeRecord = record.attendanceData.find(
                          (emp) => emp.employeeId === employee.employeeId
                        );
                        if (employeeRecord) {
                          if (
                            employeeRecord.status === 'Present' ||
                            employeeRecord.status === 'Late'
                          ) {
                            return count + 1;
                          }
                          if (employeeRecord.status === 'Half-day') {
                            return count + 0.5;
                          }
                        }
                        return count;
                      },
                      0
                    );
                    const lateDays = filteredAttendance.reduce(
                      (count, record) => {
                        const employeeRecord = record.attendanceData.find(
                          (emp) =>
                            emp.employeeId === employee.employeeId &&
                            emp.status === 'Late'
                        );
                        return employeeRecord ? count + 1 : count;
                      },
                      0
                    );
                    // Apply Salary Hike
                    const matchingHikes = salaryHikes.filter(
                      (hike) => hike.employeeId == employee.employeeId
                    );
                    if (matchingHikes.length > 0) {
                      const totalHike = matchingHikes.reduce(
                        (accumulatedHike, hike) =>
                          accumulatedHike + hike.monthlyHike,
                        0
                      );
                      employee.salary += totalHike;
                    }
                    // Calculate Payroll Data
                    let doubleLopDays = 0;
                    const petrolExpenses = 0;
                    const lateLopDays = Math.floor(lateDays / 3);
                    const casualDays = this.getCasualDaysCount(
                      employee.joiningDate,
                      payrollMonth
                    );
                    const absentDays =
                      presentDays > 0 && workingDays > 0
                        ? workingDays - presentDays
                        : 0;
                    const totalAbsentDays =
                      casualDays > 0 && absentDays
                        ? Math.max(0, absentDays - casualDays)
                        : absentDays || 0;
                    const daySalary = Number(
                      (employee.salary / workingDays).toFixed()
                    );
                    const absentAndLate =
                      absentDays > 0 || lateLopDays > 0
                        ? casualDays > 0 && absentDays == 0.5
                          ? Math.max(0, absentDays - casualDays) + lateLopDays
                          : absentDays + lateLopDays - casualDays
                        : absentDays + lateLopDays;
                    const totalDeductedDaysWithoutDLOP = absentAndLate;
                    const totalDeductedDaysWithDLOP =
                      absentAndLate + doubleLopDays;
                    const paidDaysWithoutDLOP =
                      workingDays - totalDeductedDaysWithoutDLOP;
                    const paidDaysWithDLOP =
                      workingDays - totalDeductedDaysWithDLOP;
                    const baseNetSalaryWithoutDLOP = Number(
                      (paidDaysWithoutDLOP * daySalary).toFixed()
                    );
                    const baseNetSalaryWithDLOP = Number(
                      (paidDaysWithDLOP * daySalary).toFixed()
                    );
                    const baseDeductionsWithoutDLOP =
                      employee.salary - baseNetSalaryWithoutDLOP;
                    const baseDeductionsWithDLOP =
                      employee.salary - baseNetSalaryWithDLOP;
                    let netSalaryWithoutDoubleLop =
                      totalDeductedDaysWithoutDLOP === 0
                        ? employee.salary
                        : baseNetSalaryWithoutDLOP;
                    let netSalaryWithDoubleLop =
                      totalDeductedDaysWithDLOP === 0
                        ? employee.salary
                        : baseNetSalaryWithDLOP;
                    const deductionsWithoutDLOP =
                      totalDeductedDaysWithoutDLOP === 0
                        ? 0
                        : baseDeductionsWithoutDLOP;
                    const deductionsWithDLOP =
                      totalDeductedDaysWithDLOP === 0
                        ? 0
                        : baseDeductionsWithDLOP;
                    const lopOption = 'withoutDoubleLOP';
                    let netSalary =
                      lopOption === 'withoutDoubleLOP'
                        ? netSalaryWithoutDoubleLop + petrolExpenses
                        : netSalaryWithDoubleLop + petrolExpenses;
                    const deductions =
                      lopOption === 'withoutDoubleLOP'
                        ? deductionsWithoutDLOP
                        : deductionsWithDLOP;
                    const paidDays =
                      lopOption === 'withoutDoubleLOP'
                        ? paidDaysWithoutDLOP
                        : paidDaysWithDLOP;
                    // Deduct Professional Tax
                    let professionalTax = 0;
                    if (employee.salary > 20000) {
                      professionalTax = 200;
                    } else if (employee.salary > 15000) {
                      professionalTax = 150;
                    }
                    netSalary -= professionalTax;
                    netSalaryWithoutDoubleLop -= professionalTax;
                    netSalaryWithDoubleLop -= professionalTax;
                    const payrollData = {
                      payrollMonth,
                      employeeName: employee.employeeName,
                      employeeId: employee.employeeId,
                      customEmployeeId: employee.customEmployeeId,
                      joiningDate: employee.joiningDate,
                      workingDays,
                      presentDays,
                      absentDays,
                      casualDays,
                      totalAbsentDays,
                      doubleLopDays, // Removed DLOP logic for now
                      lateLopDays,
                      salary: employee.salary,
                      daySalary,
                      petrolExpenses,
                      accountNumber: employee.accountNumber,
                      ifscCode: employee.ifscCode,
                      bankBranch: employee.bankBranch,
                      totalDeductedDaysWithoutDLOP,
                      totalDeductedDaysWithDLOP,
                      paidDaysWithoutDLOP,
                      paidDaysWithDLOP,
                      netSalaryWithoutDoubleLop,
                      netSalaryWithDoubleLop,
                      deductionsWithoutDLOP,
                      deductionsWithDLOP,
                      lopOption,
                      netSalary,
                      deductions,
                      paidDays,
                      professionalTax,
                    };
                    console.log('Payroll Data:', payrollData);
                    // Push payroll request to array
                    payrollRequests.push(
                      this.employeesService.createPayroll(payrollData)
                    );
                  });
                  // Execute all payroll requests in parallel
                  forkJoin(payrollRequests).subscribe(
                    (results) => {
                      this.loading = false;
                      this.toastService.showSuccess(
                        'All Payrolls Added Successfully'
                      );
                      this.routingService.handleRoute('payroll', null);
                    },
                    (error) => {
                      this.loading = false;
                      this.toastService.showError(error);
                      console.error(error);
                    }
                  );
                },
                (error) => {
                  this.toastService.showError(error);
                  this.loading = false;
                  console.error(error);
                }
              );
            },
            (error) => {
              this.toastService.showError(error);
              this.loading = false;
              console.error(error);
            }
          );
        },
        (error) => {
          this.toastService.showError('Error fetching employees.');
          this.loading = false;
          console.error(error);
        }
      );
  }
  getWorkingDays(payrollMonth: string): number {
    if (!payrollMonth) {
      return 0;
    }

    const startOfMonth = this.moment(payrollMonth, 'YYYY-MM').startOf('month');
    const endOfMonth = this.moment(payrollMonth, 'YYYY-MM').endOf('month');
    let workingDaysCount = 0;

    for (
      let day = startOfMonth.clone();
      day.isBefore(endOfMonth) || day.isSame(endOfMonth, 'day');
      day.add(1, 'days')
    ) {
      if (day.isoWeekday() !== 7 && !this.isHoliday(day)) {
        workingDaysCount++;
      }
    }
    return workingDaysCount;
  }
  isHoliday(day: any): boolean {
    const dayStr = day.format('YYYY-MM-DD');
    return this.holidays.some((holiday) => holiday.date == dayStr);
  }
  getHolidays(filter = {}) {
    this.loading = true;
    this.employeesService.getHolidays(filter).subscribe(
      (response) => {
        this.holidays = response;
        console.log('holidays', this.holidays);
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  getSalaryHikes(filter) {
    return this.employeesService.getSalaryHikes(filter);
  }
  getCasualDaysCount(joiningDate: Date, payrollMonth: string): number {
    const joining = new Date(joiningDate);
    const payroll = new Date(this.moment(payrollMonth, 'YYYY-MM').toDate());

    let eligibleCasualMonth: Date;
    if (joining.getDate() < 4) {
      eligibleCasualMonth = new Date(
        joining.getFullYear(),
        joining.getMonth() + 3,
        1
      );
    } else {
      eligibleCasualMonth = new Date(
        joining.getFullYear(),
        joining.getMonth() + 4,
        1
      );
    }

    return payroll >= eligibleCasualMonth ? 1 : 0;
  }
  applyFilters(searchFilter = {}) {
    this.searchFilter = searchFilter;
    console.log(this.currentTableEvent);
    this.loadPayslips(this.currentTableEvent);
  }

  applyConfigFilters(event) {
    let api_filter = event;
    if (api_filter['reset']) {
      delete api_filter['reset'];
      this.appliedFilter = {};
    } else {
      this.appliedFilter = api_filter;
    }
    this.localStorageService.setItemOnLocalStorage(
      'payrollAppliedFilter',
      this.appliedFilter
    );
    this.loadPayslips(this.currentTableEvent);
  }

  getStatusColor(status: string): {
    textColor: string;
    backgroundColor: string;
  } {
    switch (status) {
      case 'Super Admin':
        return { textColor: '#FFFFFF', backgroundColor: '#18BADD' };
      case 'Admin':
        return { textColor: '#FFFFFF', backgroundColor: '#2A328F' };
      case 'HR Admin':
        return { textColor: '#FFFFFF', backgroundColor: '#9367B4' };
      case 'Support Team':
        return { textColor: '#FFFFFF', backgroundColor: '#F78181' };
      default:
        return { textColor: 'black', backgroundColor: 'white' };
    }
  }

  updateUser(payslipId) {
    this.routingService.handleRoute('payroll/update/' + payslipId, null);
  }

  confirmDelete(payslip) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this Payroll ? <br>
              Employee Name: ${payslip.employeeName}<br>
              Payroll ID: ${payslip.payslipId}
              `,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deletePayroll(payslip.payslipId);
      },
    });
  }

  deletePayroll(payslipId) {
    this.loading = true;
    this.employeesService.deletePayroll(payslipId).subscribe(
      (response: any) => {
        console.log(response);
        this.toastService.showSuccess(response?.message);
        this.loading = false;
        this.loadPayslips(this.currentTableEvent);
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }

  createPayroll() {
    this.routingService.handleRoute('payroll/create', null);
  }

  ViewPayslip(payslipId) {
    this.routingService.handleRoute('payroll/payslip/' + payslipId, null);
  }
  goBack() {
    this.location.back();
  }
}
