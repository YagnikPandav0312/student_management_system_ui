import { inject, Injectable, signal } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Status } from '../../model/api.model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Common {
  public spinnerService = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);
  public http: HttpClient;
  private userIdSubject = new BehaviorSubject<number | null>(null);
  userId$ = this.userIdSubject.asObservable();
  public isSidebarOpen = signal<boolean>(
    typeof window !== 'undefined' ? window.innerWidth > 992 : true,
  );

  public userData = signal<any | null>(null);

  constructor() {
    const storedUser = localStorage.getItem('userData');

    if (storedUser) {
      this.userData.set(JSON.parse(storedUser));
    }
    
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 992) {
      this.isSidebarOpen.set(false);
    }
  }

  showSpinner(): void {
    this.spinnerService.show();
  }

  hideSpinner(): void {
    this.spinnerService.hide();
  }

  manageStatus(status: Status) {
    if (status.code === 0) {
      this.toastr.success(status.message);
    }

    if (status.code === 1) {
      this.toastr.warning(status.message);
    }

    if (status.code === 2) {
      this.toastr.error(status.message, 'Error');
    }
  }

  setUserId(id: number | null) {
    this.userIdSubject.next(id);
  }

  getUserId(): number | null {
    return this.userIdSubject.value || Number(localStorage.getItem('userId'));
  }
}
