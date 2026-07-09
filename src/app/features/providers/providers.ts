import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProviderService } from '../../core/services/provider';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditProviders } from './add-edit-providers/add-edit-providers';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { BaseResponse } from '../../model/api.model';
import { ProviderList } from '../../model/provider.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-providers',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './providers.html',
  styleUrl: './providers.scss',
})
export class Providers implements OnInit {
  providers = signal<ProviderList[]>([]);
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalItems = signal<number>(0);

  showingFrom = computed(() => {
    if (this.providers().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });
  showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  private providerService = inject(ProviderService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);
  private destroyRef = inject(DestroyRef);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.GetProviders();
    });
  }

  getLogoUrl(logoPath: string | null | undefined): string | null {
    if (!logoPath) return null;
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://') || logoPath.startsWith('data:')) {
      return logoPath;
    }
    let path = logoPath.replace(/\/+/g, '/');
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    return `http://localhost:3000${path}`;
  }

  ngOnInit(): void {
    this.GetProviders();
  }

  GetProviders(): void {
    this.commonService.showSpinner();
    const pagination: any = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchQuery()?.trim() || '',
    };
    this.providerService.getProviders(pagination).subscribe({
      next: (res: BaseResponse<ProviderList[]>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.providers.set(res.data || []);
          this.totalItems.set(res.total_records || 0);
          this.commonService.hideSpinner();
        } else {
          this.commonService.manageStatus(res.status);
          this.commonService.hideSpinner();
        }
      },
      error: (err: any) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.message || 'Error occurred while loading providers');
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onPageChange(p: number): void {
    this.currentPage.set(p);
    this.GetProviders();
  }

  openFormModal(item?: ProviderList): void {
    const modalRef = this.modalService.open(AddEditProviders, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.provider = item;
    modalRef.componentInstance.close.subscribe((isSaved?: boolean) => {
      if (isSaved) {
        this.GetProviders();
      }
      modalRef.close();
    });
  }

  onDeleteProvider(provider: ProviderList): void {
    const modalRef = this.modalService.open(Confirm, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.title = 'Delete Provider';
    modalRef.componentInstance.message = `Are you sure you want to delete "${provider.provider_name}"?`;
    modalRef.componentInstance.onClose.subscribe((returnData: any) => {
      if (returnData) {
        this.commonService.showSpinner();
        this.providerService.deleteProvider(provider.provider_id).subscribe({
          next: (res: BaseResponse<any>) => {
            this.commonService.hideSpinner();
            if (res.status.code === 0) {
              this.commonService.manageStatus(res.status);
              if (this.providers().length === 1 && this.currentPage() > 1) {
                this.currentPage.update(p => p - 1);
              }
              this.GetProviders();
            } else {
              this.commonService.manageStatus(res.status);
            }
          },
          error: (err) => {
            this.commonService.hideSpinner();
            this.toastr.error(err.error?.message || 'Error occurred while deleting provider');
          },
        });
      }
      modalRef.close();
    });
  }
}
