import { Injectable } from '@angular/core';
import moment from 'moment-timezone';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ServiceMeta } from './service-meta';

/** Default timezone for the HRM app (attendance, late rules, dates). */
export const APP_TIMEZONE = 'Asia/Kolkata';

// Format all moment operations in IST.
moment.tz.setDefault(APP_TIMEZONE);

@Injectable({
  providedIn: 'root',
})
export class DateTimeProcessorService {
  /** Difference between server IST clock and browser clock (ms). */
  private serverOffsetMs = 0;

  constructor(private serviceMeta: ServiceMeta) {}

  /**
   * Sync with server IST time so attendance is not tied to the user's PC clock.
   * Safe to call repeatedly; falls back to browser time if the API fails.
   */
  syncServerTime(): Observable<void> {
    return this.serviceMeta.httpGet('attendance/server-time').pipe(
      tap((res: any) => {
        if (res?.date && res?.time) {
          const serverMoment = moment.tz(
            `${res.date} ${res.time}`,
            'YYYY-MM-DD HH:mm:ss',
            APP_TIMEZONE,
          );
          this.serverOffsetMs = serverMoment.valueOf() - Date.now();
        } else if (res && typeof res.timestamp === 'number') {
          this.serverOffsetMs = res.timestamp - Date.now();
        }
      }),
      map(() => undefined),
      catchError(() => of(undefined)),
    );
  }

  /** Moment instance locked to Asia/Kolkata (IST). */
  getMoment() {
    const service = this;
    const wrapper: any = (...args: any[]) => {
      if (args.length === 0) {
        return service.now();
      }
      return moment(...args);
    };
    Object.assign(wrapper, moment);
    return wrapper;
  }

  getAppTimezone(): string {
    return APP_TIMEZONE;
  }

  /** Current date/time in IST (synced with server when available). */
  now() {
    return moment.tz(Date.now() + this.serverOffsetMs, APP_TIMEZONE);
  }

  getMomentDate(pdate: any) {
    return moment.tz(pdate, 'YYYY-MM-DD HH:mm', APP_TIMEZONE).format();
  }

  getStringFromDate_YYYYMMDD(inputDate) {
    const today = moment.tz(inputDate, APP_TIMEZONE);
    return today.format('YYYY-MM-DD');
  }
}
