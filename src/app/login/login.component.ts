import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../auth.service';
import { LocalStorageService } from '../services/local-storage.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';
import { projectConstantsLocal } from '../constants/project-constants';
import { EmployeesService } from '../admin/employees/employees.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  clicked = false;
  version = projectConstantsLocal.VERSION_DESKTOP;
  api_loading: any = false;
  isPasswordVisible: boolean = false;
  carousalImages: any = [
    {
      url: 'assets/images/slider/slider1',
    },
    {
      url: 'assets/images/slider/slider4.png',
    },
    {
      url: 'assets/images/slider/slider5.jpg',
    },
    {
      url: 'assets/images/slider/slider3.jpg',
    },
    {
      url: 'assets/images/slider/slider6.jpg',
    },
  ];
  userType: string = 'user'; // Default to User
  constructor(
    private formBuilder: UntypedFormBuilder,
    private authService: AuthService,
    private employeesService: EmployeesService,
    private localStorageService: LocalStorageService,
    private toastService: ToastService,
    private router: Router
  ) {}
  ngOnInit() {
    // this.employeesService.startIpUpdateInterval();
    this.createForm();
    // localStorage.setItem('userType', JSON.stringify(this.userType));
    this.localStorageService.setItemOnLocalStorage('userType', this.userType);
  }

  toggleUserType() {
    this.userType = this.userType === 'user' ? 'employee' : 'user';
    // localStorage.setItem('userType', JSON.stringify(this.userType));
    this.localStorageService.setItemOnLocalStorage('userType', this.userType);
  }
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  doForgotPassword() {}
  createForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required])],
      encryptedPassword: ['', Validators.compose([Validators.required])],
    });
  }
  onSignIn() {
    if (this.loginForm.valid) {
      this.clicked = true;
      this.onSubmit(this.loginForm.value);
    }
  }
  onSubmit(loginData) {
    let payload = {
      username: loginData.username,
      encryptedPassword: loginData.encryptedPassword,
    };
    this.api_loading = true;
    console.log(payload);
    this.authService.userLogin(payload).subscribe(
      (data: any) => {
        console.log(data);
        this.api_loading = false;
        if (data && data['accessToken']) {
          this.localStorageService.setItemOnLocalStorage(
            'accessToken',
            data['accessToken']
          );
          this.localStorageService.setItemOnLocalStorage(
            'userDetails',
            jwtDecode(data['accessToken'])
          );
          // this.router.navigate(['user', 'dashboard'], {
          //   queryParams: { v: this.version },
          // });
          if (this.userType === 'user') {
            this.router.navigate(['user', 'dashboard'], {
              queryParams: { v: this.version },
            });
          } else if (this.userType === 'employee') {
            this.router.navigate(['employee', 'dashboard'], {
              queryParams: { v: this.version },
            });
          }
        }
      },
      (error) => {
        this.api_loading = false;
        this.clicked = false;
        this.toastService.showError(error);
      }
    );
  }
}
