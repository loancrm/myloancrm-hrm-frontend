import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import {
  BehaviorSubject,
  from,
  Observable,
  of,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { Router } from '@angular/router';
import { LocalStorageService } from './services/local-storage.service';
import { projectConstantsLocal } from './constants/project-constants';
import { EmployeesService } from './admin/employees/employees.service';
import axios from 'axios';

@Injectable()
export class ExtendhttpInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private employeesService: EmployeesService,
    private localStorageService: LocalStorageService
  ) {}

  // intercept(
  //   request: HttpRequest<unknown>,
  //   next: HttpHandler
  // ): Observable<HttpEvent<unknown>> {
  //   const authToken =
  //     this.localStorageService.getItemFromLocalStorage('accessToken');
  //     // console.log(authToken)
  //   if (authToken) {
  //     request = request.clone({
  //       setHeaders: {
  //         Authorization: `Bearer ${authToken}`,
  //       },
  //     });
  //   }
  //   request = request.clone({
  //     url: request.url.startsWith('http')
  //       ? request.url
  //       : projectConstantsLocal.BASE_URL + request.url,
  //     responseType: 'json',
  //   });
  //   return next.handle(request).pipe(
  //     tap(
  //       () => {},
  //       // (error) => {
  //       //   if (error.status === 401) {
  //       //     this.router.navigate(['/login']);
  //       //   }
  //       // }
  //       (error) => {
  //         console.log(error);
  //         if (error.status === 401 || error.status === 419) {
  //           this.localStorageService.clearAllFromLocalStorage();
  //           this.router.navigate(['user', 'login']);
  //         }
  //       }
  //     )
  //   );
  // }

  // intercept(
  //   request: HttpRequest<unknown>,
  //   next: HttpHandler
  // ): Observable<HttpEvent<unknown>> {
  //   const authToken =
  //     this.localStorageService.getItemFromLocalStorage('accessToken');
  //   if (authToken) {
  //     request = request.clone({
  //       setHeaders: {
  //         Authorization: `Bearer ${authToken}`,
  //       },
  //     });
  //   }
  //   return from(this.employeesService.getClientIp()).pipe(
  //     switchMap((clientIp) => {
  //       const userType = localStorage.getItem('userType') || '';
  //       console.log(userType)
  //       console.log(clientIp);
  //       request = request.clone({
  //         url: request.url.startsWith('http')
  //           ? request.url
  //           : projectConstantsLocal.BASE_URL + request.url,
  //         responseType: 'json',
  //         // setHeaders: {
  //         //   'mysystem-IP': clientIp,
  //         // },
  //         ...(request.url.startsWith('http')
  //           ? {}
  //           : {
  //               setHeaders: {
  //                 'mysystem-IP': clientIp,
  //                 'user-type': userType, // Add userType header here
  //               },
  //             }),
  //       });
  //       return next.handle(request);
  //     }),
  //     tap(
  //       () => {},
  //       (error) => {
  //         console.log(error);
  //         if (error.status === 401 || error.status === 419) {
  //           this.localStorageService.clearAllFromLocalStorage();
  //           this.router.navigate(['user', 'login']);
  //         }
  //       }
  //     )
  //   );
  // }
  // private clientIp: string | null = null; // Store the cached IP address
  // private lastFetchedTime: number | null = null; // Store the last time the IP was fetched
  // private readonly IP_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  // constructor(
  //   private employeesService: EmployeesService,
  //   private localStorageService: LocalStorageService,
  //   private router: Router
  // ) {}

  // private shouldFetchIp(): boolean {
  //   return (
  //     !this.clientIp ||
  //     !this.lastFetchedTime ||
  //     Date.now() - this.lastFetchedTime > this.IP_CACHE_DURATION
  //   );
  // }
  // private fetchClientIp(): Observable<string> {
  //   if (!this.shouldFetchIp()) {
  //     return of(this.clientIp!); // Return the cached IP if it's still valid
  //   }
  //   return from(this.employeesService.getClientIp()).pipe(
  //     tap((ip) => {
  //       if (this.clientIp !== ip) {
  //         this.clientIp = ip; // Update IP only if it has changed
  //         this.lastFetchedTime = Date.now(); // Update the time when the IP was fetched
  //       }
  //     })
  //   );
  // }
  // intercept(
  //   request: HttpRequest<unknown>,
  //   next: HttpHandler
  // ): Observable<HttpEvent<unknown>> {
  //   const authToken =
  //     this.localStorageService.getItemFromLocalStorage('accessToken');

  //   if (authToken) {
  //     request = request.clone({
  //       setHeaders: {
  //         Authorization: `Bearer ${authToken}`,
  //       },
  //     });
  //   }

  //   // Use cached IP or fetch new IP if needed
  //   const clientIp$ = this.fetchClientIp();

  //   return clientIp$.pipe(
  //     switchMap((clientIp) => {
  //       const userType = localStorage.getItem('userType') || '';

  //       request = request.clone({
  //         url: request.url.startsWith('http')
  //           ? request.url
  //           : projectConstantsLocal.BASE_URL + request.url,
  //         responseType: 'json',
  //         ...(request.url.startsWith('http')
  //           ? {}
  //           : {
  //               setHeaders: {
  //                 'mysystem-IP': clientIp || '', // Use cached or fetched IP
  //                 'user-type': userType,
  //               },
  //             }),
  //       });

  //       return next.handle(request);
  //     }),
  //     tap(
  //       () => {},
  //       (error) => {
  //         console.log(error);
  //         if (error.status === 401 || error.status === 419) {
  //           this.localStorageService.clearAllFromLocalStorage();
  //           this.router.navigate(['user', 'login']);
  //         }
  //       }
  //     )
  //   );
  // }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const authToken =
      this.localStorageService.getItemFromLocalStorage('accessToken');
    // const clientIp = localStorage.getItem('clientIp') || '';
    // const userType = localStorage.getItem('userType') || '';
    const userType =
      this.localStorageService.getItemFromLocalStorage('userType') || '';
    const clientIp =
      this.localStorageService.getItemFromLocalStorage('clientIp') || '';
    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    }
    request = request.clone({
      url: request.url.startsWith('http')
        ? request.url
        : projectConstantsLocal.BASE_URL + request.url,
      responseType: 'json',
      ...(request.url.startsWith('http')
        ? {}
        : {
            setHeaders: {
              'mysystem-IP': clientIp,
              'user-type': userType,
            },
          }),
    });

    return next.handle(request).pipe(
      tap(
        () => {},
        (error) => {
          console.log(error);
          if (error.status === 401 || error.status === 419) {
            this.localStorageService.clearAllFromLocalStorage();
            this.router.navigate(['user', 'login']);
          }
        }
      )
    );
  }
}
