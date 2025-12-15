import { Injectable } from '@angular/core';
import { ServiceMeta } from './service-meta';

@Injectable({
  providedIn: 'root',
})
export class BranchesService {
  constructor(private serviceMeta: ServiceMeta) {}

  getBranches(filter = {}) {
    const url = 'branches';
    return this.serviceMeta.httpGet(url, null, filter);
  }

  getBranchById(id: string) {
    const url = `branches/${id}`;
    return this.serviceMeta.httpGet(url);
  }

  getBranchesCount(filter = {}) {
    const url = 'branches/total';
    return this.serviceMeta.httpGet(url, null, filter);
  }

  createBranch(data: any) {
    const url = 'branches';
    return this.serviceMeta.httpPost(url, data);
  }

  updateBranch(id: string, data: any) {
    const url = `branches/${id}`;
    return this.serviceMeta.httpPut(url, data);
  }

  deleteBranch(id: string) {
    const url = `branches/${id}`;
    return this.serviceMeta.httpDelete(url);
  }

  changeBranchStatus(branchId: string, statusId: string) {
    const url = `branches/${branchId}/changestatus/${statusId}`;
    return this.serviceMeta.httpPut(url, null);
  }
}

