import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SportService } from '../../core/services/sport';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditSport } from './add-edit-sport/add-edit-sport';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { BaseResponse } from '../../model/api.model';
import { SportList } from '../../model/sport.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sport',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './sport.html',
  styleUrl: './sport.scss',
})
export class Sport implements OnInit {
  sports = signal<SportList[]>([]);
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalItems = signal<number>(0);
  sort_by = signal<string>('sport_id');
  sort_order = signal<string>('DESC');
  
  showingFrom = computed(() => {
    if (this.sports().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });
  showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  private sportService = inject(SportService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);
  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => {
        this.searchQuery.set(query);
        this.currentPage.set(1);
        this.GetSports();
      });
  }

  ngOnInit(): void {
    this.GetSports();
  }

  GetSports(): void {
    this.commonService.showSpinner();
    const payload: any = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchQuery()?.trim() || '',
      sort_by: this.sort_by(),
      sort_order: this.sort_order(),
      user_id: this.commonService.getUserId() || 0,
    };
    this.sportService.getSports(payload).subscribe({
      next: (res: BaseResponse<SportList[]>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.sports.set(res.data || []);
          this.totalItems.set(res.total_records || 0);
        } else {
          this.commonService.manageStatus(res.status);
        }
      },
      error: (err: any) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.status?.message || 'Error occurred while loading sports');
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onPageChange(p: number): void {
    this.currentPage.set(p);
    this.GetSports();
  }

  openFormModal(item?: SportList): void {
    const modalRef = this.modalService.open(AddEditSport, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.sport = item;
    modalRef.componentInstance.close.subscribe((isSaved?: boolean) => {
      if (isSaved) {
        this.GetSports();
      }
      modalRef.close();
    });
  }

  onDeleteSport(sport: SportList): void {
    const modalRef = this.modalService.open(Confirm, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.title = 'Delete Sport';
    modalRef.componentInstance.message = `Are you sure you want to delete "${sport.sport_name}"?`;
    modalRef.componentInstance.onClose.subscribe((returnData: any) => {
      if (returnData) {
        this.commonService.showSpinner();
        const payload: any = {
          sport_id: sport.sport_id,
          user_id: this.commonService.getUserId() || 0,
        };
        this.sportService.deleteSport(payload).subscribe({
          next: (res: BaseResponse<any>) => {
            this.commonService.hideSpinner();
            if (res.status.code === 0) {
              this.commonService.manageStatus(res.status);
              if (this.sports().length === 1 && this.currentPage() > 1) {
                this.currentPage.update((p) => p - 1);
              }
              this.GetSports();
            } else {
              this.commonService.manageStatus(res.status);
            }
          },
          error: (err) => {
            this.commonService.hideSpinner();
            this.toastr.error(err.error?.status?.message || 'Error occurred while deleting sport');
          },
        });
      }
      modalRef.close();
    });
  }

  onToggleStatus(sport: SportList): void {
    this.commonService.showSpinner();
    const payload: any = {
      sport_id: sport.sport_id,
      status: !sport.is_active,
      user_id: this.commonService.getUserId(),
    };
    this.sportService.updateSportStatus(payload).subscribe({
      next: (res: BaseResponse<any>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.commonService.manageStatus(res.status);
          this.GetSports();
        } else {
          this.commonService.manageStatus(res.status);
        }
      },
      error: (err) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.status?.message || 'Error occurred while updating sport status');
      },
    });
  }

  sort(column: string) {
    if (this.sort_by() === column) {
      this.sort_order.update((sort_order) => (sort_order === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      this.sort_by.set(column);
      this.sort_order.set('ASC');
    }
    this.GetSports();
  }
}
