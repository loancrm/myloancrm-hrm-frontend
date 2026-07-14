import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private messageService: MessageService) {}
  showToast(type, heading, content) {
    this.messageService.add({
      severity: type,
      summary: heading,
      detail: content,
    });
  }
  showSuccess(message) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
    });
  }
  showInfo(message) {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: message,
    });
  }
  showWarn(message) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: message,
    });
  }
  showError(message) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message.error,
    });
  }
}
