import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeviceTypeService } from '../../core/services/device-type';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditDeviceType } from './add-edit-device-type/add-edit-device-type';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { BaseResponse } from '../../model/api.model';
import { DeviceTypeList } from '../../model/device-type.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-device-type',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './device-type.html',
  styleUrl: './device-type.scss',
})
export class DeviceType implements OnInit {
  deviceTypes = signal<DeviceTypeList[]>([]);
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalItems = signal<number>(0);
  sort_by = signal<string>('device_type_id');
  sort_order = signal<string>('DESC');

  showingFrom = computed(() => {
    if (this.deviceTypes().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });
  showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  private deviceTypeService = inject(DeviceTypeService);
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
      this.GetDesviceTypeList();
    });
  }

  ngOnInit(): void {
    this.GetDesviceTypeList();
  }

  GetDesviceTypeList(): void {
    this.commonService.showSpinner();
    const pagination: any = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchQuery()?.trim() || '',
      sort_by: this.sort_by(),
      sort_order: this.sort_order(),
      user_id: this.commonService.getUserId() || 0
    };
    this.deviceTypeService.getDeviceTypes(pagination).subscribe({
      next: (res: BaseResponse<DeviceTypeList[]>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.deviceTypes.set(res.data || []);
          this.totalItems.set(res.total_records || 0);
          this.commonService.hideSpinner();
        } else {
          this.commonService.manageStatus(res.status);
          this.commonService.hideSpinner();
        }
      },
      error: (err: any) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.status?.message || 'Error occurred while loading device types');
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onPageChange(p: number): void {
    this.currentPage.set(p);
    this.GetDesviceTypeList();
  }

  openFormModal(item?: any): void {
    const modalRef = this.modalService.open(AddEditDeviceType, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.deviceType = item;
    modalRef.componentInstance.close.subscribe((isSaved?: boolean) => {
      if (isSaved) {
        this.GetDesviceTypeList();
      }
      modalRef.close();
    });
  }

  onDeleteDeviceType(deviceType: any): void {
    const modalRef = this.modalService.open(Confirm, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.title = 'Delete Device Type';
    modalRef.componentInstance.message = `Are you sure you want to delete "${deviceType.device_type_name}"?`;
    modalRef.componentInstance.onClose.subscribe((returnData: any) => {
      if (returnData) {
        this.commonService.showSpinner();
        const payload: any = {
          device_type_id: deviceType.device_type_id,
          user_id: this.commonService.getUserId() || 0,
        };
        this.deviceTypeService.deleteDeviceType(payload).subscribe({
          next: (res: BaseResponse<any>) => {
            this.commonService.hideSpinner();
            if (res.status.code === 0) {
              this.commonService.manageStatus(res.status);
              if (this.deviceTypes().length === 1 && this.currentPage() > 1) {
                this.currentPage.update(p => p - 1);
              }
              this.GetDesviceTypeList();
              this.commonService.hideSpinner();
            } else {
              this.commonService.manageStatus(res.status);
              this.commonService.hideSpinner();
            }
          },
          error: (err) => {
            this.commonService.hideSpinner();
            this.toastr.error(err.error?.status?.message || 'Error occurred while deleting device type');
          },
        });
      }
      modalRef.close();
    });
  }

  onToggleStatus(deviceType: DeviceTypeList): void {
    this.commonService.showSpinner();
    const payload: any = {
      device_type_id: deviceType.device_type_id,
      status: !deviceType.is_active,
      user_id: this.commonService.getUserId() || 0,
    };
    this.deviceTypeService.updateDeviceTypeStatus(payload).subscribe({
      next: (res: BaseResponse<any>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.commonService.manageStatus(res.status);
          this.GetDesviceTypeList();
        } else {
          this.commonService.manageStatus(res.status);
        }
      },
      error: (err) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.status?.message || 'Error occurred while updating device type status');
      },
    });
  }

  sort(column: string) {
    if (this.sort_by() === column) {
      this.sort_order.update(sort_order => sort_order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sort_by.set(column);
      this.sort_order.set('ASC');
    }
    this.GetDesviceTypeList();
  }
}
