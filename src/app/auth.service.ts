import { Injectable } from '@angular/core';
import { LocalStorageService } from './services/local-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ServiceMeta } from './services/service-meta';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;

  constructor(
    private localStorageService: LocalStorageService,
    private jwtHelper: JwtHelperService,
    private serviceMeta: ServiceMeta
  ) {}

  isLoggedIn(): boolean {
    let accessToken =
      this.localStorageService.getItemFromLocalStorage('accessToken');
    if (accessToken) {
      if (this.validateToken(accessToken)) {
        this.isAuthenticated = true;
      }
    } else {
      this.isAuthenticated = false;
    }
    return this.isAuthenticated;
  }

  validateToken(token: string) {
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return true;
    } else {
      return false;
    }
  }

  doLogout() {
    return new Promise((resolve, reject) => {
      this.userLogout().subscribe(
        (data: any) => {
          resolve(true);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  userLogin(data) {
    const url = 'user/login';
    return this.serviceMeta.httpPost(url, data);
  }

  userLogout() {
    const url = 'user/logout';
    return this.serviceMeta.httpPost(url, null);
  }
}
