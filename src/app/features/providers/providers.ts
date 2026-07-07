import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProviderService } from '../../core/services/provider';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditProviders } from './add-edit-providers/add-edit-providers';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { BaseResponse } from '../../model/api.model';
import { ProviderList } from '../../model/provider.model';

@Component({
  selector: 'app-providers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './providers.html',
  styleUrl: './providers.scss',
})
export class Providers implements OnInit {
  providers = signal<ProviderList[]>([]);
  searchQuery = signal<string>('');
  selectedProvider = signal<ProviderList | null>(null);

  private providerService = inject(ProviderService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);

  filteredProviders = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.providers();
    return this.providers().filter(p => 
      p.provider_name.toLowerCase().includes(query) ||
      (p.slug && p.slug.toLowerCase().includes(query))
    );
  });

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
    this.loadProviders();
  }

  loadProviders(): void {
    this.commonService.showSpinner();
    this.providerService.getProviders().subscribe({
      next: (res: BaseResponse<ProviderList[]>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.providers.set(res.data || []);
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

  openFormModal(item?: ProviderList): void {
    const modalRef = this.modalService.open(AddEditProviders, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.provider = item;
    modalRef.componentInstance.close.subscribe((isSaved?: boolean) => {
      if (isSaved) {
        this.loadProviders();
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
              this.loadProviders();
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
