import { Component, inject } from '@angular/core';
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
export class Header {
  public modelService = inject(NgbModal);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  public commonService = inject(Common);

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
