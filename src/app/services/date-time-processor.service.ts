import { Injectable } from '@angular/core';
import moment from 'moment';
@Injectable({
  providedIn: 'root',
})
export class DateTimeProcessorService {
  constructor() {}

  getMoment() {
    return moment;
  }

  getMomentDate(pdate: any) {
    return moment(pdate, 'YYYY-MM-DD HH:mm').format();
  }

  getStringFromDate_YYYYMMDD(inputDate) {
    const today = new Date(inputDate);
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    let cday = '';
    if (dd < 10) {
      cday = '0' + dd;
    } else {
      cday = '' + dd;
    }
    let cmon;
    if (mm < 10) {
      cmon = '0' + mm;
    } else {
      cmon = '' + mm;
    }
    const dateString = yyyy + '-' + cmon + '-' + cday;
    return dateString;
  }
}
