import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private storage: Storage;

  constructor() {
    this.storage = localStorage;
  }

  getItemFromLocalStorage(key: string): any {
    const item = this.storage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return null;
  }

  setItemOnLocalStorage(key: string, value: any): void {
    this.storage.setItem(key, JSON.stringify(value));
  }

  removeItemFromLocalStorage(key: string): void {
    this.storage.removeItem(key);
  }

  // clearAllFromLocalStorage(): void {
  //   this.storage.clear();
  // }

  clearAllFromLocalStorage(): void {
    const keysToKeep = ['clientIp', 'clientIpTime','userType'];
    Object.keys(localStorage).forEach((key) => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  }
}
