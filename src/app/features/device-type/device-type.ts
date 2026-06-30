import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeviceTypeService } from '../../core/services/device-type';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditDeviceType } from './add-edit-device-type/add-edit-device-type';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-device-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './device-type.html',
  styleUrl: './device-type.scss',
})
export class DeviceType implements OnInit {
  deviceTypes = signal<any[]>([]);
  searchQuery = signal<string>('');

  private deviceTypeService = inject(DeviceTypeService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);

  filteredDeviceTypes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.deviceTypes();
    }
    return this.deviceTypes().filter(
      (dt) =>
        (dt.device_type_name && dt.device_type_name.toLowerCase().includes(query)) ||
        (dt.slug && dt.slug.toLowerCase().includes(query))
    );
  });

  ngOnInit(): void {
    this.loadDeviceTypes();
  }

  loadDeviceTypes(): void {
    this.commonService.showSpinner();
    this.deviceTypeService.getDeviceTypes().subscribe({
      next: (res) => {
        this.commonService.hideSpinner();
        if (res.success) {
          this.deviceTypes.set(res.data || []);
        } else {
          this.toastr.error(res.message || 'Failed to fetch device types');
        }
      },
      error: (err) => {
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
        this.loadDeviceTypes();
      }
      modalRef.close();
    });
  }

  onDeleteDeviceType(deviceType: any): void {
    if (confirm(`Are you sure you want to delete "${deviceType.device_type_name}"?`)) {
      this.commonService.showSpinner();
      this.deviceTypeService.deleteDeviceType(deviceType.device_type_id).subscribe({
        next: (res) => {
          this.commonService.hideSpinner();
          if (res.success) {
            this.toastr.success(res.message || 'Device type deleted successfully');
            this.loadDeviceTypes();
          } else {
            this.toastr.error(res.message || 'Failed to delete device type');
          }
        },
        error: (err) => {
          this.commonService.hideSpinner();
          this.toastr.error(err.error?.message || 'Error occurred while deleting device type');
        },
      });
    }
  }
}
