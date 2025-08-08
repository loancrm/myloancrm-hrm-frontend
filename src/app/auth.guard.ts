import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { LocalStorageService } from './services/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  userType: any;
  constructor(
    private authService: AuthService,
    private router: Router,
    private localStorage: LocalStorageService
  ) {
    this.userType = this.localStorage.getItemFromLocalStorage('userType');
  }

  canActivate(): boolean | UrlTree {
    console.log('this.authService.isLoggedIn()', this.authService.isLoggedIn());
    if (this.authService.isLoggedIn()) {
      this.router.createUrlTree(['/user/dashboard']);
      return true;
    } else {
      console.log("else condition ")
      return this.router.createUrlTree(['/user/login']);
    }
  }
}
