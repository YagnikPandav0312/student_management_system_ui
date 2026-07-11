import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Common } from '../../core/services/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { Auth } from '../../core/services/auth';


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
  private authService = inject(Auth);

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
        this.authService.logout().subscribe({
          next: (data) => {
            localStorage.clear();
            this.router.navigate(['/login']);
            this.toastr.success(data.status.message);
          },
          error: (err) => { 
            localStorage.clear();
            this.router.navigate(['/login']);
            this.toastr.error(err.status.message);
          }
        });
      }
      modalRef.close();
    });
  }
}
