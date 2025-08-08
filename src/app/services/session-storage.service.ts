import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  private storage: Storage;

  constructor() {
    this.storage = sessionStorage;
  }

  getItemFromSessionStorage(key: string): any {
    const item = this.storage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return null;
  }

  setItemOnSessionStorage(key: string, value: any): void {
    this.storage.setItem(key, JSON.stringify(value));
  }

  removeItemFromSessionStorage(key: string): void {
    this.storage.removeItem(key);
  }

  clearAllFromSessionStorage(): void {
    this.storage.clear();
  }
}
