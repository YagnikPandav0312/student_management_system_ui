import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Common } from '../../core/services/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';


@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  public modelService = inject(NgbModal);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  public commonService = inject(Common);

  fullName = signal<string>('');
  avatarLetter = computed(() => {
    const name = this.fullName();
    return name ? name.charAt(0).toUpperCase() : '';
  });

  ngOnInit(): void {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.full_name) {
          this.fullName.set(user.full_name);
        }
      }
    } catch (e) {
      console.error('Failed to parse user details in header', e);
    }
  }

  logOut() {
    const modalRef = this.modelService.open(Confirm, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.title = 'Logout';
    modalRef.componentInstance.message = 'Are you sure you want to logout ?';
    modalRef.componentInstance.onClose.subscribe((returnData: any) => {
      if (returnData) {
        this.router.navigate(['/login']);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.clear();
        this.toastr.success('User logout successfully !');
      }
      modalRef.close();
    });
  }
}
