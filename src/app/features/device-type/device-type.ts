import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeviceTypeService } from '../../core/services/device-type';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditDeviceType } from './add-edit-device-type/add-edit-device-type';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { BaseResponse } from '../../model/api.model';
import { DeviceTypeList } from '../../model/device-type.model';

@Component({
  selector: 'app-device-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './device-type.html',
  styleUrl: './device-type.scss',
})
export class DeviceType implements OnInit {
  deviceTypes = signal<DeviceTypeList[]>([]);
  searchQuery = signal<string>('');

  private deviceTypeService = inject(DeviceTypeService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);

  ngOnInit(): void {
    this.getDesviceTypeList();
  }

  getDesviceTypeList(): void {
    this.commonService.showSpinner();
    this.deviceTypeService.getDeviceTypes().subscribe({
      next: (res: BaseResponse<DeviceTypeList[]>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.deviceTypes.set(res.data || []);
          this.commonService.hideSpinner();
        } else {
          this.commonService.manageStatus(res.status);
          this.commonService.hideSpinner();
        }
      },
      error: (err: any) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.message || 'Error occurred while loading device types');
      },
    });
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
        this.getDesviceTypeList();
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
        this.deviceTypeService.deleteDeviceType(deviceType.device_type_id).subscribe({
          next: (res: BaseResponse<any>) => {
            this.commonService.hideSpinner();
            if (res.status.code === 0) {
              this.getDesviceTypeList();
              this.commonService.manageStatus(res.status);
              this.commonService.hideSpinner();
            } else {
              this.commonService.manageStatus(res.status);
              this.commonService.hideSpinner();
            }
          },
          error: (err) => {
            this.commonService.hideSpinner();
            this.toastr.error(err.error?.message || 'Error occurred while deleting device type');
          },
        });
      }
      modalRef.close();
    });
  }
}
