import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { LocalStorageService } from '../services/local-storage.service';

@Component({
  selector: 'app-sso-auth',
  template: ''
})
export class SsoAuthComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localStorage: LocalStorageService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.localStorage.setItemOnLocalStorage('accessToken', token);


    const decoded: any = jwtDecode(token);
    const user = decoded.user;

    this.localStorage.setItemOnLocalStorage('userDetails', { user });

    this.router.navigate(['/user/dashboard']);
  }
}
