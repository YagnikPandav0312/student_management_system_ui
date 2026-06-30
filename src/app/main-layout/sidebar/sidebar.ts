import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { ToastrService } from 'ngx-toastr';

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
