import { Injectable } from '@angular/core';
import { ServiceMeta } from './service-meta';

@Injectable({
  providedIn: 'root',
})
export class CompanySettingsService {
  constructor(private serviceMeta: ServiceMeta) {}

  getCompanySettings() {
    const url = 'companySettings';
    return this.serviceMeta.httpGet(url);
  }

  updateCompanySettings(data: any) {
    const url = 'companySettings';
    return this.serviceMeta.httpPut(url, data);
  }
}

