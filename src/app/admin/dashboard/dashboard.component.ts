import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { RoutingService } from 'src/app/services/routing-service';
import { EmployeesService } from '../employees/employees.service';
import { ToastService } from 'src/app/services/toast.service';
import { forkJoin } from 'rxjs';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
import { Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  userDetails: any;
  maleCount: number = 0;
  femaleCount: number = 0;
  panjaguttaCount: number = 0;
  @ViewChild('employeesTable') employeesTable!: Table;
  BegumpetCount: number = 0;
  selectedDate: any;
  loading: any;
  apiLoading: any;
  totalEmployeesCount: any = 0;
  designationsCount: any = 0;
  incentivesCount: any = 0;
  pieChartOptions: any;
  branchpieChartOptions: any;
  DepartmentChartOptions: any;
  moment: any;
  totalPresentCount: number = 0;
  totalAbsentCount: number = 0;
  totalHalfDayCount: number = 0;
  totalLateCount: number = 0;
  attendanceData: any;
  totalUsersCount: any = 0;
  totalLeavesCount: any = 0;
  employees: any[] = [];
  leaves: any[] = [];
  totalInterviewsCount: any = 0;
  employeeDetails: any[] = [];
  totalHolidaysCount: any = 0;
  lastMonthpayrollCount: any = 0;
  currentTableEvent: any;
  countsAnalytics: any[] = [];
  designationCounts: any[] = [];
  selectedDateforPayroll: Date;
  selectedDateforIncentive: Date;
  selectedYear: number;
  isLoading = true;
  capabilities: any;
  employeeData: any = null;
  currentYear: number;
  checkInTime: Date | null = null;
  checkOutTime: Date | null = null;
  loggedHours: string = '0 : 0 : 0';
  timerInterval: any;
  status: any;
  reason: any;
  clientIp: any;
  allowedIps: string[] = [];
  constructor(
    private localStorageService: LocalStorageService,
    private routingService: RoutingService,
    private employeesService: EmployeesService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    private dateTimeProcessor: DateTimeProcessorService
  ) {
    this.moment = this.dateTimeProcessor.getMoment();
    this.selectedDateforIncentive = this.moment(new Date())
      .subtract(1, 'month')
      .format('YYYY-MM');
    this.selectedDateforPayroll = this.moment(new Date())
      .subtract(1, 'month')
      .format('YYYY-MM');
    this.selectedYear = new Date().getFullYear();
  }
  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
    const userDetails =
      this.localStorageService.getItemFromLocalStorage('userDetails');
    if (userDetails) {
      this.userDetails = userDetails.user;
    }
    this.clientIp =
      this.localStorageService.getItemFromLocalStorage('clientIp');
    this.capabilities = this.employeesService.getUserRbac();
    console.log('capabilities', this.capabilities);
    this.selectedDate = this.moment().format('YYYY-MM-DD');
    if (this.capabilities.employee) {
      this.getIpAddress();
    }
    if (!this.capabilities.employee) {
      this.getAttendanceByDate();
    }
    if (this.userDetails.employeeId && this.capabilities.employee) {
      this.getEmployeeById(this.userDetails?.employeeId);
    }
    this.setChartOptions();
    this.updateCountsAnalytics();
    if (!this.capabilities.employee) {
      this.initializeDashboardData();
    }
    this.fetchAttendance();
  }

  getIpAddress(filter = {}) {
    this.apiLoading = true;
    this.employeesService.getIpAddress(filter).subscribe({
      next: (response: any) => {
        this.allowedIps = response.map((row) =>
          row.ipAddress.split('.').slice(0, 2).join('.')
        );
        console.log('Allowed IP Addresses:', this.allowedIps);
        this.apiLoading = false;
      },
      error: (error) => {
        this.apiLoading = false;
        this.toastService.showError(error);
      },
    });
  }
  checkIpAccess(): boolean {
    const ip = this.clientIp.split('.').slice(0, 2).join('.');
    return ip !== null && this.allowedIps.includes(ip);
  }
  checkIn() {
    // this.saveAttendance(true);
    this.confirmationService.confirm({
      // message: 'Are you sure you want to delete this Employee?',
      message: `Are you sure you want to Check In ?<br>
              `,
      header: 'Confirm Check In ',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.saveAttendance(true);
      },
    });
  }
  checkOut() {
    // this.saveAttendance(false);
    // this.stopLoggedHoursTimer();

    this.confirmationService.confirm({
      // message: 'Are you sure you want to delete this Employee?',
      message: `Are you sure you want to Check Out ?<br>
              `,
      header: 'Confirm Check Out',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.saveAttendance(false);
        this.stopLoggedHoursTimer();
      },
    });
  }
  startLoggedHoursTimer() {
    if (this.checkInTime) {
      this.timerInterval = setInterval(() => {
        this.loggedHours = this.calculateLiveLoggedHours();
      }, 1000); // Update every second
    }
  }

  // saveAttendance(isCheckIn: boolean, filter = {}) {
  //   const attendanceDate = this.moment(this.selectedDate).format('YYYY-MM-DD');
  //   const attendanceFilter = { ...filter, 'attendanceDate-eq': attendanceDate };
  //   this.loading = true;
  //   this.employeesService.getAttendance(attendanceFilter).subscribe(
  //     (existingRecords: any) => {
  //       let attendanceRecord =
  //         existingRecords.length > 0 ? existingRecords[0] : null;
  //       let updatedAttendanceData = attendanceRecord
  //         ? [...attendanceRecord.attendanceData]
  //         : [];
  //       const now = this.moment();
  //       const currentTime = now.format('HH:mm');
  //       const lateThreshold = this.moment('10:15', 'HH:mm');
  //       const checkOutThreshold = this.moment('18:30', 'HH:mm');
  //       let status = now.isAfter(lateThreshold) ? 'Late' : 'Present';
  //       if (!attendanceRecord) {
  //         // No attendance record exists -> Initialize employees as "Absent"
  //         this.employeesService
  //           .getEmployees({
  //             'employeeInternalStatus-eq': 1,
  //             sort: 'joiningDate,asc',
  //           })
  //           .subscribe((activeEmployees: any) => {
  //             updatedAttendanceData = activeEmployees.map((employee) => {
  //               const leaveRecord = this.leaves?.find(
  //                 (leave) => leave.employeeId === employee.employeeId
  //               );
  //               return {
  //                 employeeId: employee.employeeId,
  //                 status: leaveRecord
  //                   ? 'On Leave'
  //                   : employee.employeeId === this.employeeData.employeeId
  //                   ? status
  //                   : 'Absent',
  //                 checkInTime:
  //                   employee.employeeId === this.employeeData.employeeId
  //                     ? currentTime
  //                     : null,
  //                 checkOutTime: null,
  //                 reason: leaveRecord ? leaveRecord.reason : '',
  //               };
  //             });
  //             this.saveOrUpdateAttendance(
  //               attendanceRecord,
  //               attendanceDate,
  //               updatedAttendanceData
  //             );
  //           });
  //       } else {
  //         // ✅ Check if employee already exists in attendance data
  //         const employeeIndex = updatedAttendanceData.findIndex(
  //           (data: any) => data.employeeId === this.employeeData.employeeId
  //         );

  //         if (employeeIndex !== -1) {
  //           if (isCheckIn) {
  //             // ✅ Check-In: Update status and check-in time
  //             updatedAttendanceData[employeeIndex].status = status;
  //             updatedAttendanceData[employeeIndex].checkInTime = currentTime;
  //           } else {
  //             // ✅ Check-Out: Update check-out time and calculate total duration
  //             const checkInMoment = this.moment(
  //               updatedAttendanceData[employeeIndex].checkInTime,
  //               'HH:mm'
  //             );
  //             const totalDuration = now.diff(checkInMoment, 'hours', true);
  //             let updatedStatus = updatedAttendanceData[employeeIndex].status; // Keep initial status
  //             if (totalDuration >= 3.5 && totalDuration <= 6) {
  //               updatedStatus = 'Half-day';
  //             } else if (now.isBefore(checkOutThreshold)) {
  //               updatedStatus = 'Late';
  //             }
  //             updatedAttendanceData[employeeIndex].checkOutTime = currentTime;
  //             updatedAttendanceData[employeeIndex].status = updatedStatus;
  //           }
  //         }
  //         this.saveOrUpdateAttendance(
  //           attendanceRecord,
  //           attendanceDate,
  //           updatedAttendanceData
  //         );
  //       }
  //     },
  //     (error: any) => {
  //       this.loading = false;
  //       this.toastService.showError(error);
  //     }
  //   );
  // }
  saveAttendance(isCheckIn: boolean, filter = {}) {
    const attendanceDate = this.moment(this.selectedDate).format('YYYY-MM-DD');
    const attendanceFilter = { ...filter, 'attendanceDate-eq': attendanceDate };
    this.loading = true;
    filter['leaveFrom-lte'] = attendanceDate;
    filter['leaveTo-gte'] = attendanceDate;
    filter['leaveInternalStatus-or'] = "1,2";
    // ✅ Step 1: Fetch leave records first
    this.employeesService.getLeaves(filter).subscribe(
      (leavesData: any) => {
        this.leaves = leavesData; // Store leaves globally
        // ✅ Step 2: Fetch attendance records
        this.employeesService.getAttendance(attendanceFilter).subscribe(
          (existingRecords: any) => {
            let attendanceRecord =
              existingRecords.length > 0 ? existingRecords[0] : null;
            let updatedAttendanceData = attendanceRecord
              ? [...attendanceRecord.attendanceData]
              : [];
            const now = this.moment();
            const currentTime = now.format('HH:mm');
            const lateThreshold = this.moment('10:15', 'HH:mm');
            const checkOutThreshold = this.moment('18:30', 'HH:mm');
            let status = now.isAfter(lateThreshold) ? 'Late' : 'Present';
            if (!attendanceRecord) {
              // ✅ No attendance record → Initialize attendance from active employees
              this.employeesService
                .getEmployees({
                  'employeeInternalStatus-eq': 1,
                  sort: 'joiningDate,asc',
                })
                .subscribe((activeEmployees: any) => {
                  updatedAttendanceData = activeEmployees.map((employee) => {
                    const leaveRecord = this.leaves.find(
                      (leave) => leave.employeeId === employee.employeeId
                    );
                    return {
                      employeeId: employee.employeeId,
                      status: leaveRecord
                        ? (leaveRecord.durationType == 'half-day'
                          ? 'Half-day'
                          : 'Absent')
                        : (employee.employeeId === this.employeeData.employeeId
                          ? status
                          : 'Absent'),
                      checkInTime:
                        employee.employeeId === this.employeeData.employeeId
                          ? currentTime
                          : null,
                      checkOutTime: null,
                      reason: leaveRecord ? leaveRecord.reason : '',
                    };
                  });

                  // Save attendance with initialized data
                  this.saveOrUpdateAttendance(
                    attendanceRecord,
                    attendanceDate,
                    updatedAttendanceData
                  );
                });
            } else {
              // ✅ Attendance exists → Check if employee record needs updating
              const employeeIndex = updatedAttendanceData.findIndex(
                (data: any) => data.employeeId === this.employeeData.employeeId
              );

              if (employeeIndex !== -1) {
                if (isCheckIn) {
                  // ✅ Check-in: Update status and check-in time
                  updatedAttendanceData[employeeIndex].status = status;
                  updatedAttendanceData[employeeIndex].checkInTime =
                    currentTime;
                } else {
                  // ✅ Check-out: Update checkout time & duration
                  const checkInMoment = this.moment(
                    updatedAttendanceData[employeeIndex].checkInTime,
                    'HH:mm'
                  );
                  const totalDuration = now.diff(checkInMoment, 'hours', true);
                  let updatedStatus =
                    updatedAttendanceData[employeeIndex].status;

                  if (totalDuration >= 3.5 && totalDuration <= 6) {
                    updatedStatus = 'Half-day';
                  } else if (now.isBefore(checkOutThreshold)) {
                    updatedStatus = 'Late';
                  }
                  updatedAttendanceData[employeeIndex].checkOutTime =
                    currentTime;
                  updatedAttendanceData[employeeIndex].status = updatedStatus;
                }
              }
              else {
                // ✅ If employee is missing in attendance, add them
                updatedAttendanceData.push({
                  employeeId: this.employeeData.employeeId,
                  status: status,
                  checkInTime: isCheckIn ? currentTime : null,
                  checkOutTime: isCheckIn ? null : currentTime,
                  reason: '',
                });
              }
              // Save the updated attendance record
              this.saveOrUpdateAttendance(
                attendanceRecord,
                attendanceDate,
                updatedAttendanceData
              );
            }
          },
          (error: any) => {
            this.loading = false;
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

  // ✅ Function to Save or Update Attendance Record
  private saveOrUpdateAttendance(
    attendanceRecord: any,
    attendanceDate: string,
    updatedAttendanceData: any
  ) {
    const attendanceData = {
      attendanceDate: attendanceDate,
      attendanceData: updatedAttendanceData,
    };
    if (attendanceRecord) {
      this.employeesService
        .updateAttendance(attendanceRecord.attendanceId, attendanceData)
        .subscribe(
          () => {
            this.loading = false;
            this.toastService.showSuccess('Attendance Updated Successfully');
            this.fetchAttendance();
          },
          (error: any) => {
            this.loading = false;
            this.toastService.showError(error);
          }
        );
    } else {
      this.employeesService.createAttendance(attendanceData).subscribe(
        () => {
          this.loading = false;
          this.toastService.showSuccess('Attendance Added Successfully');
          this.fetchAttendance();
        },
        (error: any) => {
          this.loading = false;
          this.toastService.showError(error);
        }
      );
    }
  }


  fetchAttendance(filter = {}) {
    const attendanceDate = this.moment(this.selectedDate).format('YYYY-MM-DD');
    const attendanceFilter = { ...filter, 'attendanceDate-eq': attendanceDate };

    this.employeesService.getAttendance(attendanceFilter).subscribe(
      (attendanceRecords: any) => {
        if (attendanceRecords && attendanceRecords.length > 0) {
          const latestAttendance = attendanceRecords[0]; // Get latest entry
          const attendanceData = latestAttendance.attendanceData.find(
            (data: any) => data.employeeId == this.userDetails.employeeId
          );

          if (attendanceData) {
            this.checkInTime = attendanceData.checkInTime;
            this.checkOutTime = attendanceData.checkOutTime;
            this.status = attendanceData.status;
            this.reason = attendanceData.reason;
            if (!this.checkOutTime) {
              this.startLoggedHoursTimer();
            } else {
              this.loggedHours = this.calculateLoggedHours();
            }
          } else {
            this.resetAttendance();
          }
        } else {
          this.resetAttendance();
        }
      },
      (error: any) => {
        this.toastService.showError(error);
      }
    );
  }

  calculateLiveLoggedHours(): string {
    // console.log(this.checkInTime);
    if (this.checkInTime) {
      const checkInMoment = this.moment(this.checkInTime, 'HH:mm');
      const nowMoment = this.moment();
      const duration = this.moment.duration(nowMoment.diff(checkInMoment));
      return `${duration.hours()} : ${duration.minutes()} : ${duration.seconds()}`;
    }
    return '0 : 0 : 0';
  }
  calculateLoggedHours(): string {
    if (this.checkInTime && this.checkOutTime) {
      const checkInMoment = this.moment(this.checkInTime, 'HH:mm');
      const checkOutMoment = this.moment(this.checkOutTime, 'HH:mm');
      const duration = this.moment.duration(checkOutMoment.diff(checkInMoment));
      return `${duration.hours()} : ${duration.minutes()} :  ${duration.seconds()}`;
    }
    return '0 : 0 : 0';
  }

  stopLoggedHoursTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetAttendance() {
    this.stopLoggedHoursTimer();
    this.checkInTime = null;
    this.checkOutTime = null;
    this.loggedHours = '0 : 0 : 0';
  }
  onImageLoad1() {
    console.log('Image loaded');
    this.isLoading = false;
  }
  onImageError1() {
    console.log('Image failed to load');
    this.isLoading = false;
  }
  initializeDashboardData() {
    this.fetchCounts();
    this.getGenderCounts();
    this.getBranchCounts();
    this.getDepartmentCounts();
  }
  onDateChange(event: any) {
    console.log(event);
    this.selectedDate = this.moment(event).format('YYYY-MM-DD');
    this.attendanceData = [];
    this.employeeDetails = [];
    this.employees = [];
    this.getAttendanceByDate()
      .then(() => {
        this.employeesTable.reset();
      })
      .catch((error) => {
        console.error('Failed to get attendance data:', error);
        this.toastService.showError('Failed to load attendance data.');
      });
  }
  getEmployeeById(id) {
    this.loading = true;
    this.employeesService.getEmployeeById(id).subscribe(
      (employeeData: any) => {
        const filter = { 'hikeInternalStatus-eq': 1 };
        this.getSalaryHikes(filter).subscribe(
          (salaryHikeData: any) => {
            if (salaryHikeData) {
              const matchingHikes = salaryHikeData.filter(
                (hike) => hike.employeeId == id
              );
              if (matchingHikes.length > 0) {
                let totalSalary = employeeData.salary;
                employeeData.salaryHikes = matchingHikes.map((hike) => {
                  totalSalary += hike.monthlyHike;
                  return {
                    hikeDate: hike.hikeDate,
                    monthlyHike: hike.monthlyHike,
                  };
                });
                employeeData.totalSalary = totalSalary;
              }
            }
            this.employeeData = employeeData;
            this.loading = false;
          },
          (error) => {
            this.loading = false;
            this.toastService.showError(error);
          }
        );
      },
      (error) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  employeeProfile(employeeId) {
    this.routingService.handleRoute('employees/profile/' + employeeId, null);
  }
  roundToLPA(amount: number): string {
    const lakhs = amount / 100000;
    return lakhs.toFixed(2) + ' LPA';
  }
  getSalaryHikes(filter) {
    return this.employeesService.getSalaryHikes(filter);
  }
  updateCountsAnalytics() {
    this.countsAnalytics = [
      {
        name: 'employees',
        displayName: 'Active Employees',
        count: this.totalEmployeesCount,
        routerLink: 'employees',
        condition: this.capabilities.adminEmployees,
        isLoading: true,
      },
      {
        name: this.userDetails?.gender == 1 ? 'female' : 'male',
        displayName: 'Profile',
        // count: this.totalEmployeesCount, // Uncomment if needed
        routerLink: this.userDetails
          ? `employees/profile/${this.userDetails.employeeId}`
          : 'employees/profile',
        condition: this.capabilities?.employee, // Safe navigation in case capabilities is undefined
        isLoading: true,
      },
      {
        name: 'interviews',
        displayName: 'Upcomming Interviews',
        count: this.totalInterviewsCount,
        routerLink: 'interviews',
        condition: this.capabilities.interviews,
        isLoading: true,
      },
      {
        name: 'attendance',
        displayName: this.capabilities.employee
          ? 'Attendance'
          : 'Today Attendance',
        count:
          this.totalPresentCount + this.totalLateCount + this.totalHalfDayCount,
        routerLink: 'attendance',
        condition:
          this.capabilities.adminAttendance ||
          this.capabilities.employeeAttendance,
        isLoading: true,
      },
      {
        name: 'payroll',
        displayName: this.capabilities.employee
          ? 'Payroll'
          : 'Last Month Payroll',
        count: this.lastMonthpayrollCount,
        routerLink: 'payroll',
        condition:
          this.capabilities.adminPayroll || this.capabilities.employeePayroll,
        isLoading: true,
      },
      {
        name: 'leaves',
        displayName: this.capabilities.employee ? 'Leaves' : 'Pending Leaves',
        count: this.totalLeavesCount,
        routerLink: 'leaves',
        condition:
          this.capabilities.adminLeaves || this.capabilities.employeeLeaves,
        isLoading: true,
      },
      {
        name: 'holidays',
        displayName: `${new Date().getFullYear()} Holidays`, // Dynamically set based on current year
        count: this.totalHolidaysCount,
        routerLink: 'holidays',
        condition: this.capabilities.holidays,
        isLoading: true,
      },
      {
        name: 'incentives',
        displayName: 'Incentives',
        count: this.incentivesCount,
        routerLink: 'incentives',
        condition:
          this.capabilities.adminIncentives ||
          this.capabilities.employeeIncentives,
        isLoading: true,
      },
      {
        name: 'departments',
        displayName: 'Departments',
        count: this.designationsCount,
        routerLink: 'designations',
        condition: this.capabilities.departments,
        isLoading: true,
      },
      {
        name: 'salaryhike',
        displayName: 'Salary Hikes',
        condition: this.capabilities.employeeSalaryHikes,
        routerLink: 'salaryhikes',
        isLoading: true,
      },
      // {
      //   name: 'events',
      //   displayName: 'Events',
      //   count: 0,
      //   routerLink: 'events',
      //   condition: true,
      // },
      {
        name: 'users',
        displayName: 'Users',
        count: this.totalUsersCount,
        routerLink: 'users',
        condition: this.capabilities.users,
        // condition: true,
        // condition:
        //   this.userDetails?.designation == 1 ||
        //   this.userDetails?.designation == 4,
        isLoading: true,
      },
      // {
      //   name: 'reports',
      //   displayName: 'Reports',
      //   count: 0,
      //   routerLink: 'reports',
      //   condition: true,
      // },
    ];
  }

  // updateCountsAnalytics() {
  //   const isEmployee = this.capabilities?.employee;
  //   if (isEmployee) {
  //     this.countsAnalytics = [
  //       {
  //         name: 'attendance',
  //         displayName: 'Attendance',
  //         routerLink: 'attendance',
  //         condition: true,
  //         isLoading: true,
  //       },
  //       {
  //         name: 'payroll',
  //         displayName: 'Payroll',
  //         routerLink: 'payroll',
  //         condition: true,
  //         isLoading: true,
  //       },
  //       {
  //         name: 'leaves',
  //         displayName: 'Leave Management',
  //         routerLink: 'leaves',
  //         condition: true,
  //         isLoading: true,
  //       },
  //       {
  //         name: 'salaryhike',
  //         displayName: 'Salary Hikes',
  //         routerLink: 'salaryhikes',
  //         condition: true,
  //         isLoading: true,
  //       },
  //       {
  //         name: 'incentives',
  //         displayName: 'Incentives',
  //         routerLink: 'incentives',
  //         condition: true,
  //         isLoading: true,
  //       },
  //       {
  //         name: 'holidays',
  //         displayName: 'Holidays',
  //         routerLink: 'holidays',
  //         condition: true,
  //         isLoading: true,
  //       },
  //     ];
  //   } else {
  //     this.countsAnalytics = [
  //       {
  //         name: 'employees',
  //         displayName: 'Employees',
  //         count: this.totalEmployeesCount,
  //         routerLink: 'employees',
  //         condition: true,
  //         isLoading: true,
  //       },
  //       {
  //         name: 'interviews',
  //         displayName: 'Interviews',
  //         count: this.totalInterviewsCount,
  //         routerLink: 'interviews',
  //         condition: true,
  //         isLoading: true,
  //       },
  //       {
  //         name: 'attendance',
  //         displayName: 'Attendance',
  //         count:
  //           this.totalPresentCount +
  //           this.totalLateCount +
  //           this.totalHalfDayCount,
  //         routerLink: 'attendance',
  //         condition: true,
  //         isLoading: true,
  //       },
  //       {
  //         name: 'payroll',
  //         displayName: 'Payroll',
  //         count: this.lastMonthpayrollCount,
  //         routerLink: 'payroll',
  //         condition: true,
  //         isLoading: true,
  //       },
  //       {
  //         name: 'leaves',
  //         displayName: 'Leave Management',
  //         count: this.totalLeavesCount,
  //         routerLink: 'leaves',
  //         condition: true,
  //         isLoading: true,
  //       },
  //       {
  //         name: 'holidays',
  //         displayName: 'Holidays',
  //         count: this.totalHolidaysCount,
  //         routerLink: 'holidays',
  //         condition: true,
  //         isLoading: true,
  //       },
  //       {
  //         name: 'incentives',
  //         displayName: 'Incentives',
  //         count: this.incentivesCount,
  //         routerLink: 'incentives',
  //         condition: true,
  //         isLoading: true,
  //       },
  //       {
  //         name: 'departments',
  //         displayName: 'Departments',
  //         count: this.designationsCount,
  //         routerLink: 'designations',
  //         condition: true,
  //         isLoading: true,
  //       },
  //       {
  //         name: 'users',
  //         displayName: 'Users',
  //         count: this.totalUsersCount,
  //         routerLink: 'users',
  //         // condition: true,
  //         condition:
  //           this.userDetails?.designation == 1 ||
  //           this.userDetails?.designation == 4,
  //         isLoading: true,
  //       },
  //     ];
  //   }
  // }

  onImageLoad(item: any): void {
    item.isLoading = false;
  }

  onImageError(item: any): void {
    item.isLoading = false;
    item.name = 'placeholder';
  }
  calculateAttendanceCounts(): void {
    this.totalPresentCount =
      this.totalAbsentCount =
      this.totalHalfDayCount =
      this.totalLateCount =
      0;
    this.attendanceData[0]?.attendanceData.forEach((attendance) => {
      switch (attendance.status) {
        case 'Present':
          this.totalPresentCount++;
          break;
        case 'Absent':
          this.totalAbsentCount++;
          break;
        case 'Late':
          this.totalLateCount++;
          break;
        case 'Half-day':
          this.totalHalfDayCount++;
          break;
      }
    });
    this.updateCountsAnalytics();
    console.log(
      `Present: ${this.totalPresentCount}, Absent: ${this.totalAbsentCount}, Half-day: ${this.totalHalfDayCount}, Late: ${this.totalLateCount}`
    );
  }
  loadEmployees(event) {
    this.currentTableEvent = event;
    let api_filter = this.employeesService.setFiltersFromPrimeTable(event);
    api_filter = Object.assign({}, api_filter);
    if ('from' in api_filter) {
      delete api_filter.from;
    }
    console.log(api_filter);
    if (api_filter) {
      this.getEmployees(api_filter);
    }
  }
  setDefaultAttendanceData() {
    this.employeeDetails = this.employees
      .filter((employee) =>
        this.attendanceData[0]?.attendanceData.some(
          (att) =>
            att.employeeId === employee.employeeId && att.status === 'Absent'
        )
      )
      .map((employee) => {
        const attendance = this.attendanceData[0]?.attendanceData.find(
          (att) => att.employeeId === employee.employeeId
        );
        return {
          ...employee,
          status: attendance?.status,
          checkInTime: attendance?.checkInTime,
          checkOutTime: attendance?.checkOutTime,
        };
      });
    console.log('Absent Employee Details:', this.employeeDetails);
  }
  getEmployees(filter = {}) {
    this.apiLoading = true;
    this.employeesService.getEmployees(filter).subscribe({
      next: (response: any) => {
        if (response) {
          this.employees = response;
          console.log('employees', this.employees);
          this.setDefaultAttendanceData();
        } else {
          console.warn('No employees data received');
        }
        this.apiLoading = false;
      },
      error: (error: any) => {
        this.apiLoading = false;
        this.toastService.showError(
          'Failed to load employees: ' + error.message
        );
      },
    });
  }
  getAttendanceByDate(filter = {}): Promise<void> {
    this.apiLoading = true;
    filter['attendanceDate-eq'] = this.selectedDate;
    return new Promise((resolve, reject) => {
      this.employeesService.getAttendance(filter).subscribe(
        (response: any) => {
          console.log('attendanceData:', response);
          this.attendanceData = response;
          this.apiLoading = false;
          this.calculateAttendanceCounts();
          resolve();
        },
        (error: any) => {
          this.apiLoading = false;
          this.toastService.showError('Failed to load attendance data');
          reject(error);
        }
      );
    });
  }
  fetchCounts(filter = {}) {
    this.loading = true;
    const employeefilter = { ...filter, 'employeeInternalStatus-eq': 1 };
    const interviewsfilter = { ...filter, 'interviewInternalStatus-eq': 1 };
    const leavesfilter = { ...filter, 'leaveInternalStatus-eq': 1 };
    const departmentfilter = { ...filter, 'designationInternalStatus-eq': 1 };
    const payrollfilter = {
      ...filter,
      'payrollMonth-eq': this.selectedDateforPayroll,
    };
    const holidayfilter = {
      ...filter,
    };
    if (this.selectedYear) {
      const startOfYear = this.moment(`${this.selectedYear}-01-01`).format(
        'YYYY-MM-DD'
      );
      const endOfYear = this.moment(`${this.selectedYear}-12-31`).format(
        'YYYY-MM-DD'
      );
      holidayfilter['date-gte'] = startOfYear;
      holidayfilter['date-lte'] = endOfYear;
    }
    // const incentivefilter = {
    //   ...filter,
    //   'incentiveApplicableMonth-eq': this.selectedDateforIncentive,
    // };
    forkJoin([
      this.employeesService?.getEmployeesCount(employeefilter),
      this.employeesService?.getUsersCount(filter),
      this.employeesService?.getHolidaysCount(holidayfilter),
      this.employeesService?.getInterviewCount(interviewsfilter),
      this.employeesService?.getLeavesCount(leavesfilter),
      this.employeesService?.getPayrollCount(payrollfilter),
      this.employeesService?.getDesignationCount(departmentfilter),
      this.employeesService?.getIncentivesCount(filter),
    ]).subscribe(
      ([
        employeesCount,
        usersCount,
        holidaysCount,
        interviewCount,
        leavesCount,
        payrollCount,
        designationsCount,
        incentivesCount,
      ]) => {
        this.totalEmployeesCount = employeesCount;
        this.totalUsersCount = usersCount;
        this.totalHolidaysCount = holidaysCount;
        this.totalInterviewsCount = interviewCount;
        this.totalLeavesCount = leavesCount;
        this.lastMonthpayrollCount = payrollCount;
        this.designationsCount = designationsCount;
        this.incentivesCount = incentivesCount;
        this.updateCountsAnalytics();
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  getGenderCounts(filter = {}) {
    filter['employeeInternalStatus-eq'] = 1;
    const maleFilter = { ...filter, 'gender-eq': 2 };
    const femaleFilter = { ...filter, 'gender-eq': 1 };
    this.loading = true;
    forkJoin({
      maleCount: this.employeesService?.getEmployeesCount(maleFilter),
      femaleCount: this.employeesService?.getEmployeesCount(femaleFilter),
    }).subscribe(
      (response: any) => {
        this.maleCount = response.maleCount;
        this.femaleCount = response.femaleCount;
        console.log('Male Count:', this.maleCount);
        console.log('Female Count:', this.femaleCount);
        this.setChartOptions();
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  isAllZeros(): boolean {
    return this.designationCounts.every((count) => count === 0);
  }
  getDepartmentCounts(filter = {}) {
    filter['employeeInternalStatus-eq'] = 1;
    const filters = [1, 2, 3, 4, 5].map((designation) => ({
      ...filter,
      'designation-eq': designation,
    }));
    this.loading = true;
    forkJoin(
      filters.map((f) => this.employeesService.getEmployeesCount(f))
    ).subscribe(
      (counts: any) => {
        // this.designationCounts = counts.map((count) => count || 0);
        this.designationCounts = counts;
        console.log(this.designationCounts);
        this.setChartOptions();
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }

  // getDepartmentCounts(filter = {}) {
  //   filter['employeeInternalStatus-eq'] = 1;
  //   this.getDesignations().subscribe((departmentsData: any) => {
  //     if (departmentsData) {
  //       this.departments = departmentsData;
  //       const ids = this.departments?.map((item) => item.id);
  //       console.log(ids);
  //       const filters = ids.map((designation) => ({
  //         ...filter,
  //         'designation-eq': designation,
  //       }));
  //       this.loading = true;
  //       forkJoin(
  //         filters.map((f) => this.employeesService.getEmployeesCount(f))
  //       ).subscribe(
  //         (counts: any) => {
  //           this.designationCounts = counts.map((count, index) => ({
  //             displayName: this.departments[index].displayName,
  //             count: count || 0,
  //           }));
  //           console.log(this.designationCounts);
  //           this.setChartOptions();
  //           this.loading = false;
  //         },
  //         (error: any) => {
  //           this.loading = false;
  //           this.toastService.showError(error);
  //         }
  //       );
  //     }
  //   });
  // }

  // getDesignations() {
  //   return this.employeesService.getDesignations();
  // }
  getBranchCounts(filter = {}) {
    filter['employeeInternalStatus-eq'] = 1;
    const panjaguttafilter = { ...filter, 'ofcBranch-eq': 1 };
    const begumpetfilter = { ...filter, 'ofcBranch-eq': 2 };
    this.loading = true;
    forkJoin({
      panjaguttaCount:
        this.employeesService.getEmployeesCount(panjaguttafilter),
      BegumpetCount: this.employeesService.getEmployeesCount(begumpetfilter),
    }).subscribe(
      (response: any) => {
        this.panjaguttaCount = response.panjaguttaCount;
        this.BegumpetCount = response.BegumpetCount;
        console.log('Panjagutta Count:', this.panjaguttaCount);
        console.log('Begumpet Count:', this.BegumpetCount);
        this.setChartOptions();
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        this.toastService.showError(error);
      }
    );
  }
  setChartOptions() {
    this.DepartmentChartOptions = {
      series: [
        {
          name: 'Inside Sales',
          data: [this.designationCounts[0] || 0],
        },
        {
          name: 'Operations Team',
          data: [this.designationCounts[1] || 0],
        },
        {
          name: 'Human Resource',
          data: [this.designationCounts[2] || 0],
        },
        {
          name: 'Information Technology',
          data: [this.designationCounts[3] || 0],
        },
      ],
      chart: {
        height: 400,
        type: 'bar',
        toolbar: {
          show: true,
        },
      },
      // colors: [
      //   '#640D5F',
      //   '#31425E',
      //   '#415A77',
      //   '#1E212B',
      //   '#3D5A80',
      //   '#293241',
      // ],
      colors: ['#ABA5DC', '#8E89D0', '#706EC4', '#535AB4'],
      // colors: ['#18BADD', '#3039A1', ],
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
        },
      },
      stroke: {
        width: 2,
        colors: ['#fff'],
      },
      title: {
        text: 'Departments Analytics',
        align: 'left',
        style: {
          fontSize: '20px',
          color: '#333333',
          fontWeight: '500'
        },
      },
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5,
        },
      },
      markers: {
        size: 4,
      },
      xaxis: {
        categories: ['Departments'],
        // title: {
        //   text: 'Departments',
        // },
      },
      yaxis: {
        title: {
          text: 'Count',
        },
      },
      // legend: {
      //   position: 'top',
      //   horizontalAlign: 'right',
      //   floating: true,
      //   offsetY: -20,
      //   offsetX: -5,
      // },
      legend: {
        position: 'top',
        horizontalAlign: 'center',
      },
    };
    this.pieChartOptions = {
      series: [this.maleCount || 0, this.femaleCount || 0],
      labels: ['Male', 'Female'],
      chart: {
        height: 350,
        type: 'pie',
        toolbar: { show: true },
      },
      colors: ['#ABA5DC', '#8E89D0'],
      title: {
        text: 'Employee Structure',
        align: 'left',
        style: { fontSize: '20px', color: '#333333', fontWeight: '500' },
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        floating: false,
        offsetY: 15,
        offsetX: -5,
        formatter: (seriesName, opts) => {
          const customLabels = ['Male', 'Female'];
          return `${customLabels[opts.seriesIndex]}: ${opts.w.config.series[opts.seriesIndex]
            }`;
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
          var customLabels = ['Male', 'Female'];
          var seriesValues = opts.w.config.series[opts.seriesIndex];
          var customLabel = customLabels[opts.seriesIndex];
          return customLabel + ': ' + seriesValues;
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
    this.branchpieChartOptions = {
      series: [this.panjaguttaCount || 0, this.BegumpetCount || 0],
      labels: ['Panjagutta', 'Begumpet'],
      chart: {
        height: 350,
        type: 'donut',
        toolbar: { show: true },
      },
      colors: ['#ABA5DC', '#8E89D0'],
      title: {
        text: 'Branch Wise Employees Count',
        align: 'left',
        style: { fontSize: '20px', color: '#333333', fontWeight: '500' },
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        floating: false,
        offsetY: 15,
        offsetX: -5,
        formatter: (seriesName, opts) => {
          const customLabels = ['Panjagutta', 'Begumpet'];
          return `${customLabels[opts.seriesIndex]}: ${opts.w.config.series[opts.seriesIndex]
            }`;
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
          var customLabels = ['Panjagutta', 'Begumpet'];
          var seriesValues = opts.w.config.series[opts.seriesIndex];
          var customLabel = customLabels[opts.seriesIndex];
          return customLabel + ': ' + seriesValues;
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  }
  goToRoute(route) {
    const usertype =
      this.localStorageService.getItemFromLocalStorage('userType');
    this.routingService.setFeatureRoute(usertype);
    // this.routingService.setFeatureRoute('user');
    this.routingService.handleRoute(route, null);
  }
}
