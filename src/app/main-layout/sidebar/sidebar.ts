import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { ToastrService } from 'ngx-toastr';
import { Common } from '../../core/services/common';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private modalService = inject(NgbModal);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  common = inject(Common);
  private authService = inject(Auth);
  private commonService = inject(Common);

  logOut() {
    const modalRef = this.modalService.open(Confirm, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.title = 'Logout';
    modalRef.componentInstance.message = 'Are you sure you want to logout ?';
    modalRef.componentInstance.onClose.subscribe((returnData: any) => {
      if (returnData) {
        this.authService.logout(this.commonService.getUserId()).subscribe({
          next: (res) => {
            this.router.navigate(['/login']);
            localStorage.clear();
            this.commonService.manageStatus(res.status);
            this.common.closeSidebar();
          },
          error: (err) => {
            console.error('Logout error:', err);
            this.router.navigate(['/login']);
            localStorage.clear();
            this.toastr.error(err.error?.status?.message || 'Error occurred while Logout');
          }
        });
      }
      modalRef.close();
    });
  }
}
