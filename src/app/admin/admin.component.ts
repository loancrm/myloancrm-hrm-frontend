import { Component, HostListener } from '@angular/core';
import { SubscriptionService } from '../services/subscription.service';
import { RoutingService } from '../services/routing-service';
import { Subscription } from 'rxjs';
import { LocalStorageService } from '../services/local-storage.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  subscription: Subscription;
  iswiz: any = false;
  smallMenuSection: any = false;
  bodyHeight: any;
  smallDeviceDisplay: any;
  userType: any;
  constructor(
    private localStorageService: LocalStorageService,
    private subscriptionService: SubscriptionService,
    private routingService: RoutingService
  ) {
    this.onResize();
    this.userType =
      this.localStorageService.getItemFromLocalStorage('userType');
    this.subscription = this.subscriptionService
      .getMessage()
      .subscribe((message) => {
        switch (message.ttype) {
          case 'hidemenus':
            this.iswiz = message.value;
            this.onResize();
            break;
          case 'smallMenu':
            this.smallMenuSection = message.value;
            break;
        }
      });
    // this.routingService.setFeatureRoute('user');
    this.routingService.setFeatureRoute(this.userType);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    let screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    if (screenWidth <= 672) {
      this.smallDeviceDisplay = true;
    } else {
      this.smallDeviceDisplay = false;
    }
    if (this.iswiz) {
      this.bodyHeight = screenHeight;
    } else {
      if (screenWidth <= 991) {
        this.bodyHeight = screenHeight - 107;
      } else {
        this.bodyHeight = screenHeight - 67;
      }
    }
  }
}
