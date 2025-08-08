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
    console.log('Relative Route:', relativeRoute);
    if (this.featureRoute) {
      relativeRoute = relativeRoute + '/' + this.featureRoute;
    }
    console.log('Relative Route:', relativeRoute);
    console.log('Active Route:', activeRoute);
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
    console.log('Project route:', this.projectRoute);
  }
  setFeatureRoute(route) {
    this.featureRoute = route;
    console.log('Feature route:', this.featureRoute);
  }
  setVersion(version) {
    this.version = version;
  }
  getVersion() {
    return this.version;
  }
}
