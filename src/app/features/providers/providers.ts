import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProviderService } from '../../core/services/provider';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditProviders } from './add-edit-providers/add-edit-providers';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';

@Component({
  selector: 'app-providers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './providers.html',
  styleUrl: './providers.scss',
})
export class Providers implements OnInit {
  providers = signal<any[]>([]);
  searchQuery = signal<string>('');
  selectedProvider = signal<any | null>(null);

  private providerService = inject(ProviderService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);

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
      next: (res) => {
        this.commonService.hideSpinner();
        if (res.success) {
          this.providers.set(res.data || []);
        } else {
          this.toastr.error(res.message || 'Failed to fetch providers');
        }
      },
      error: (err) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.message || 'Error occurred while loading providers');
      },
    });
  }

  openFormModal(item?: any): void {
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

  onDeleteProvider(provider: any): void {
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
          next: (res) => {
            this.commonService.hideSpinner();
            if (res.success) {
              this.toastr.success(res.message || 'Provider deleted successfully');
              this.loadProviders();
            } else {
              this.toastr.error(res.message || 'Failed to delete provider');
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
