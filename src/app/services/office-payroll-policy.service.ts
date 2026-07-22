import { Injectable } from '@angular/core';

export interface ProfessionalTaxTier {
  minSalary: number;
  taxAmount: number;
}

export interface OfficePayrollPolicy {
  officeStartTime: string;
  officeEndTime: string;
  graceMinutes: number;
  latesPerLop: number;
  payrollCycleType: 'calendar_month' | 'custom_day';
  payrollCycleStartDay: number;
  /** Paid leave days credited per payroll month when eligible */
  casualLeavesPerMonth: number;
  /** Full months to wait after joining month (joining month never counted) */
  casualLeaveAfterMonths: number;
  professionalTaxTiers: ProfessionalTaxTier[];
}

export interface PayrollPeriodRange {
  start: any;
  end: any;
  startStr: string;
  endStr: string;
}

export interface AttendanceDayFlags {
  isLateCheckIn: boolean;
  isEarlyLogout: boolean;
}

export interface AttendancePeriodCounts {
  presentDays: number;
  lateCheckInDays: number;
  earlyLogoutDays: number;
  halfDays: number;
}

@Injectable({
  providedIn: 'root',
})
export class OfficePayrollPolicyService {
  readonly EARLY_LOGOUT_STATUS = 'Early-logout';

  readonly defaults: OfficePayrollPolicy = {
    officeStartTime: '10:00',
    officeEndTime: '18:30',
    graceMinutes: 10,
    latesPerLop: 3,
    payrollCycleType: 'calendar_month',
    payrollCycleStartDay: 26,
    casualLeavesPerMonth: 1,
    casualLeaveAfterMonths: 3,
    professionalTaxTiers: [
      { minSalary: 20001, taxAmount: 200 },
      { minSalary: 15001, taxAmount: 150 },
      { minSalary: 0, taxAmount: 0 },
    ],
  };

  normalize(settings: any): OfficePayrollPolicy {
    const cycleType =
      settings?.payrollCycleType === 'custom_day'
        ? 'custom_day'
        : 'calendar_month';
    const startDay = Number(settings?.payrollCycleStartDay);
    const grace = Number(settings?.graceMinutes);
    const latesPerLop = Number(settings?.latesPerLop);
    const casualLeaves = Number(settings?.casualLeavesPerMonth);
    const afterMonths = Number(settings?.casualLeaveAfterMonths);

    return {
      officeStartTime: this.normalizeTime(
        settings?.officeStartTime,
        this.defaults.officeStartTime
      ),
      officeEndTime: this.normalizeTime(
        settings?.officeEndTime,
        this.defaults.officeEndTime
      ),
      graceMinutes:
        Number.isFinite(grace) && grace >= 0 ? grace : this.defaults.graceMinutes,
      latesPerLop:
        Number.isFinite(latesPerLop) && latesPerLop > 0
          ? Math.floor(latesPerLop)
          : this.defaults.latesPerLop,
      payrollCycleType: cycleType,
      payrollCycleStartDay:
        Number.isFinite(startDay) && startDay >= 1 && startDay <= 28
          ? Math.floor(startDay)
          : this.defaults.payrollCycleStartDay,
      casualLeavesPerMonth:
        Number.isFinite(casualLeaves) && casualLeaves >= 0
          ? Math.floor(casualLeaves)
          : this.defaults.casualLeavesPerMonth,
      casualLeaveAfterMonths:
        Number.isFinite(afterMonths) && afterMonths >= 0
          ? Math.floor(afterMonths)
          : this.defaults.casualLeaveAfterMonths,
      professionalTaxTiers: this.normalizeProfessionalTaxTiers(
        settings?.professionalTaxConfig ?? settings?.professionalTaxTiers
      ),
    };
  }

  getLateThreshold(momentLib: any, policy: OfficePayrollPolicy): any {
    const today = momentLib().format('YYYY-MM-DD');
    if (typeof momentLib.tz === 'function') {
      return momentLib
        .tz(
          `${today} ${policy.officeStartTime}`,
          'YYYY-MM-DD HH:mm',
          'Asia/Kolkata'
        )
        .add(policy.graceMinutes, 'minutes');
    }
    return momentLib(`${today} ${policy.officeStartTime}`, 'YYYY-MM-DD HH:mm').add(
      policy.graceMinutes,
      'minutes'
    );
  }

  getLateThresholdTimeOnly(momentLib: any, policy: OfficePayrollPolicy): any {
    return momentLib(policy.officeStartTime, 'HH:mm').add(
      policy.graceMinutes,
      'minutes'
    );
  }

  getCheckOutThreshold(momentLib: any, policy: OfficePayrollPolicy): any {
    const today = momentLib().format('YYYY-MM-DD');
    if (typeof momentLib.tz === 'function') {
      return momentLib.tz(
        `${today} ${policy.officeEndTime}`,
        'YYYY-MM-DD HH:mm',
        'Asia/Kolkata'
      );
    }
    return momentLib(`${today} ${policy.officeEndTime}`, 'YYYY-MM-DD HH:mm');
  }

  getCheckOutThresholdTimeOnly(momentLib: any, policy: OfficePayrollPolicy): any {
    return momentLib(policy.officeEndTime, 'HH:mm');
  }

  getLateCutoffLabel(momentLib: any, policy: OfficePayrollPolicy): string {
    return this.getLateThreshold(momentLib, policy).format('HH:mm');
  }

  getPayrollPeriod(
    momentLib: any,
    payrollMonth: string,
    policy: OfficePayrollPolicy
  ): PayrollPeriodRange {
    if (!payrollMonth) {
      const empty = momentLib();
      return { start: empty, end: empty, startStr: '', endStr: '' };
    }

    if (policy.payrollCycleType === 'custom_day') {
      const day = policy.payrollCycleStartDay;
      const start = momentLib(payrollMonth, 'YYYY-MM')
        .subtract(1, 'month')
        .date(day)
        .startOf('day');
      const end = momentLib(payrollMonth, 'YYYY-MM')
        .date(day)
        .subtract(1, 'day')
        .endOf('day');
      return {
        start,
        end,
        startStr: start.format('YYYY-MM-DD'),
        endStr: end.format('YYYY-MM-DD'),
      };
    }

    const start = momentLib(payrollMonth, 'YYYY-MM').startOf('month');
    const end = momentLib(payrollMonth, 'YYYY-MM').endOf('month');
    return {
      start,
      end,
      startStr: start.format('YYYY-MM-DD'),
      endStr: end.format('YYYY-MM-DD'),
    };
  }

  formatPeriodLabel(
    momentLib: any,
    payrollMonth: string,
    policy: OfficePayrollPolicy
  ): string {
    const period = this.getPayrollPeriod(momentLib, payrollMonth, policy);
    if (!period.startStr) {
      return '';
    }
    if (policy.payrollCycleType === 'custom_day') {
      return `${period.start.format('DD MMM YYYY')} – ${period.end.format(
        'DD MMM YYYY'
      )}`;
    }
    return period.start.format('MMMM YYYY');
  }

  getPeriodDates(
    momentLib: any,
    payrollMonth: string,
    policy: OfficePayrollPolicy
  ): Date[] {
    const period = this.getPayrollPeriod(momentLib, payrollMonth, policy);
    if (!period.startStr) {
      return [];
    }
    const dates: Date[] = [];
    for (
      let day = period.start.clone().startOf('day');
      day.format('YYYY-MM-DD') <= period.endStr;
      day.add(1, 'days')
    ) {
      dates.push(day.toDate());
    }
    return dates;
  }

  isAttendanceInPeriod(
    attendanceDate: string | Date,
    period: PayrollPeriodRange,
    momentLib: any
  ): boolean {
    const dayStr = momentLib(attendanceDate).format('YYYY-MM-DD');
    return dayStr >= period.startStr && dayStr <= period.endStr;
  }

  countWorkingDays(
    momentLib: any,
    payrollMonth: string,
    policy: OfficePayrollPolicy,
    isHolidayFn: (day: any) => boolean
  ): number {
    const period = this.getPayrollPeriod(momentLib, payrollMonth, policy);
    if (!period.startStr) {
      return 0;
    }
    let workingDaysCount = 0;
    for (
      let day = period.start.clone().startOf('day');
      day.isBefore(period.end) || day.isSame(period.end, 'day');
      day.add(1, 'days')
    ) {
      if (day.isoWeekday() !== 7 && !isHolidayFn(day)) {
        workingDaysCount++;
      }
    }
    return workingDaysCount;
  }

  /** Late check-ins + early logouts combined for LOP. */
  calculateAttendanceLopDays(
    lateCheckInDays: number,
    earlyLogoutDays: number,
    policy: OfficePayrollPolicy
  ): number {
    const divisor =
      policy.latesPerLop > 0 ? policy.latesPerLop : this.defaults.latesPerLop;
    const totalEvents =
      (Number(lateCheckInDays) || 0) + (Number(earlyLogoutDays) || 0);
    return Math.floor(totalEvents / divisor);
  }

  /** @deprecated Use calculateAttendanceLopDays with both counts. */
  calculateLateLopDays(lateDays: number, policy: OfficePayrollPolicy): number {
    return this.calculateAttendanceLopDays(lateDays, 0, policy);
  }

  calculateProfessionalTax(
    salary: number,
    policy: OfficePayrollPolicy
  ): number {
    const amount = Number(salary) || 0;
    const tiers = [...(policy.professionalTaxTiers || [])].sort(
      (a, b) => Number(b.minSalary) - Number(a.minSalary)
    );
    for (const tier of tiers) {
      if (amount >= Number(tier.minSalary)) {
        return Math.round(Number(tier.taxAmount) || 0);
      }
    }
    return 0;
  }

  getAttendanceFlags(
    momentLib: any,
    policy: OfficePayrollPolicy,
    checkInTime: string | null | undefined,
    checkOutTime: string | null | undefined,
    currentStatus?: string
  ): AttendanceDayFlags {
    if (currentStatus === 'Absent' && !checkInTime) {
      return { isLateCheckIn: false, isEarlyLogout: false };
    }
    if (!checkInTime) {
      return { isLateCheckIn: false, isEarlyLogout: false };
    }

    const checkIn = momentLib(this.normalizeTime(checkInTime, '00:00'), 'HH:mm');
    const lateThreshold = this.getLateThresholdTimeOnly(momentLib, policy);
    const isLateCheckIn = checkIn.isAfter(lateThreshold);
    let isEarlyLogout = false;

    if (checkOutTime) {
      const checkOut = momentLib(
        this.normalizeTime(checkOutTime, '00:00'),
        'HH:mm'
      );
      const hours = checkOut.diff(checkIn, 'hours', true);
      if (!(hours >= 3.5 && hours <= 6)) {
        isEarlyLogout = checkOut.isBefore(
          this.getCheckOutThresholdTimeOnly(momentLib, policy)
        );
      }
    }

    return { isLateCheckIn, isEarlyLogout };
  }

  /**
   * Display status: Late (late check-in), Early-logout, Half-day, Present, Absent.
   * Late check-in takes display priority over early logout when both occur.
   */
  evaluateAttendanceStatus(
    momentLib: any,
    policy: OfficePayrollPolicy,
    checkInTime: string | null | undefined,
    checkOutTime: string | null | undefined,
    currentStatus?: string
  ): string {
    if (currentStatus === 'Absent' && !checkInTime) {
      return 'Absent';
    }
    if (!checkInTime) {
      return currentStatus === 'Half-day' ? 'Half-day' : 'Present';
    }

    const checkIn = momentLib(this.normalizeTime(checkInTime, '00:00'), 'HH:mm');
    const flags = this.getAttendanceFlags(
      momentLib,
      policy,
      checkInTime,
      checkOutTime,
      currentStatus
    );

    if (checkOutTime) {
      const checkOut = momentLib(
        this.normalizeTime(checkOutTime, '00:00'),
        'HH:mm'
      );
      const hours = checkOut.diff(checkIn, 'hours', true);
      if (hours >= 3.5 && hours <= 6) {
        return 'Half-day';
      }
    }

    if (flags.isLateCheckIn) {
      return 'Late';
    }
    if (flags.isEarlyLogout) {
      return this.EARLY_LOGOUT_STATUS;
    }
    return 'Present';
  }

  countEmployeeAttendanceForPeriod(
    momentLib: any,
    policy: OfficePayrollPolicy,
    employeeId: any,
    filteredAttendance: any[]
  ): AttendancePeriodCounts {
    let presentDays = 0;
    let lateCheckInDays = 0;
    let earlyLogoutDays = 0;
    let halfDays = 0;

    (filteredAttendance || []).forEach((record) => {
      const employeeRecord = (record.attendanceData || []).find(
        (emp: any) => emp.employeeId === employeeId
      );
      if (!employeeRecord) {
        return;
      }

      const status = this.evaluateAttendanceStatus(
        momentLib,
        policy,
        employeeRecord.checkInTime,
        employeeRecord.checkOutTime,
        employeeRecord.status
      );
      const flags = this.getAttendanceFlags(
        momentLib,
        policy,
        employeeRecord.checkInTime,
        employeeRecord.checkOutTime,
        employeeRecord.status
      );

      if (status === 'Half-day') {
        halfDays += 1;
        presentDays += 0.5;
      } else if (
        status === 'Present' ||
        status === 'Late' ||
        status === this.EARLY_LOGOUT_STATUS
      ) {
        presentDays += 1;
      }

      if (flags.isLateCheckIn) {
        lateCheckInDays += 1;
      }
      if (flags.isEarlyLogout) {
        earlyLogoutDays += 1;
      }
    });

    return { presentDays, lateCheckInDays, earlyLogoutDays, halfDays };
  }

  /**
   * Paid leave credit for a payroll month.
   * Joining month is never counted. Then wait `casualLeaveAfterMonths`.
   * Example: join Jan, afterMonths=3 → eligible from May (5th month).
   */
  getCasualDaysCount(
    joiningDate: Date | string,
    payrollMonth: string,
    policy: OfficePayrollPolicy,
    momentLib?: any
  ): number {
    if (!joiningDate || !payrollMonth) {
      return 0;
    }
    const joining = new Date(joiningDate as any);
    if (isNaN(joining.getTime())) {
      return 0;
    }

    const waitMonths =
      policy.casualLeaveAfterMonths >= 0
        ? policy.casualLeaveAfterMonths
        : this.defaults.casualLeaveAfterMonths;
    const credit =
      policy.casualLeavesPerMonth >= 0
        ? policy.casualLeavesPerMonth
        : this.defaults.casualLeavesPerMonth;

    if (credit === 0) {
      return 0;
    }

    // Skip joining month (+1), then wait waitMonths → eligible at month waitMonths+2
    const eligiblePaidLeaveMonth = new Date(
      joining.getFullYear(),
      joining.getMonth() + waitMonths + 1,
      1
    );

    let payroll: Date;
    if (momentLib) {
      payroll = new Date(momentLib(payrollMonth, 'YYYY-MM').toDate());
    } else {
      const [y, m] = String(payrollMonth).split('-').map(Number);
      payroll = new Date(y, (m || 1) - 1, 1);
    }

    return payroll >= eligiblePaidLeaveMonth ? credit : 0;
  }

  /** Alias for paid-leave days (same as getCasualDaysCount). */
  getPaidLeaveDaysCount(
    joiningDate: Date | string,
    payrollMonth: string,
    policy: OfficePayrollPolicy,
    momentLib?: any
  ): number {
    return this.getCasualDaysCount(
      joiningDate,
      payrollMonth,
      policy,
      momentLib
    );
  }

  toProfessionalTaxStorageJson(tiers: ProfessionalTaxTier[]): string {
    return JSON.stringify(this.normalizeProfessionalTaxTiers(tiers));
  }

  private normalizeProfessionalTaxTiers(raw: any): ProfessionalTaxTier[] {
    let parsed = raw;
    if (typeof raw === 'string' && raw.trim()) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
    }
    if (!Array.isArray(parsed)) {
      return this.defaults.professionalTaxTiers.map((t) => ({ ...t }));
    }
    const tiers = parsed
      .map((tier) => ({
        minSalary: Number(tier?.minSalary),
        taxAmount: Number(tier?.taxAmount),
      }))
      .filter(
        (tier) =>
          Number.isFinite(tier.minSalary) &&
          tier.minSalary >= 0 &&
          Number.isFinite(tier.taxAmount) &&
          tier.taxAmount >= 0
      )
      .sort((a, b) => b.minSalary - a.minSalary);
    return tiers.length
      ? tiers
      : this.defaults.professionalTaxTiers.map((t) => ({ ...t }));
  }

  private normalizeTime(value: any, fallback: string): string {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
      if (match) {
        return `${match[1].padStart(2, '0')}:${match[2]}`;
      }
    }
    return fallback;
  }
}
