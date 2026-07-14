import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { projectConstantsLocal } from '../constants/project-constants';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  projectRoute = '';
  featureRoute = '';
  version = projectConstantsLocal.VERSION_DESKTOP;
  constructor(private router: Router) {}
  handleRoute(activeRoute: any, params, options?) {
    let relativeRoute = this.projectRoute;
    if (this.featureRoute) {
      relativeRoute = relativeRoute + '/' + this.featureRoute;
    }
    if (options) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
    }
    if (params) {
      params['queryParams']['v'] = this.getVersion();
      this.router.navigate([relativeRoute + '/' + activeRoute], params);
    } else {
      this.router.navigate([relativeRoute + '/' + activeRoute], {
        queryParams: { v: this.getVersion() },
      });
    }
  }
  setParentRoute(route) {
    this.projectRoute = route;
  }
  setFeatureRoute(route) {
    this.featureRoute = route;
  }
  setVersion(version) {
    this.version = version;
  }
  getVersion() {
    return this.version;
  }
}
