import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DeviceTypeService } from '../../../core/services/device-type';
import { Common } from '../../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { BaseResponse } from '../../../model/api.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DeviceTypeList } from '../../../model/device-type.model';

@Component({
  selector: 'app-add-edit-device-type',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-device-type.html',
  styleUrl: './add-edit-device-type.scss',
})
export class AddEditDeviceType implements OnInit {
  @Input() deviceType: any = null;
  @Output() close = new EventEmitter<boolean>();
  form!: FormGroup;
  submitted = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  modelService = inject(NgbActiveModal);
  private fb = inject(FormBuilder);
  private deviceTypeService = inject(DeviceTypeService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.initForm();
    if (this.deviceType) {
      this.isEditMode.set(true);
      this.form.patchValue({
        device_type_name: this.deviceType.device_type_name,
        slug: this.deviceType.slug || '',
      });
    } else {
      this.isEditMode.set(false);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      device_type_name: ['', [Validators.required, Validators.maxLength(100)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    });
    this.submitted.set(false);
    this.form.get('device_type_name')?.valueChanges.subscribe((name) => {
      if (!this.isEditMode() && name) {
        const slug = this.slugify(name);
        this.form.get('slug')?.setValue(slug, { emitEvent: false });
      }
    });
  }

  slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start
      .replace(/-+$/, ''); // Trim - from end
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      device_type_name: this.form.get('device_type_name')?.value,
      slug: this.form.get('slug')?.value,
    };

    if (this.isEditMode()) {
      this.commonService.showSpinner();
      this.deviceTypeService.updateDeviceType(this.deviceType.device_type_id, payload).subscribe({
        next: (res: BaseResponse<DeviceTypeList>) => {
          this.commonService.hideSpinner();
          if (res && res.status.code === 0) {
            this.close.emit(true);
            this.commonService.hideSpinner();
            this.commonService.manageStatus(res.status);
          } else {
            this.commonService.hideSpinner();
            this.commonService.manageStatus(res.status);
            this.toastr.error(res.status.message || 'Failed to update device type');
          }
        },
        error: (err) => {
          this.commonService.hideSpinner();
          this.toastr.error(err.error?.message || 'An error occurred while updating device type');
        },
      });
    } else {
      this.deviceTypeService.createDeviceType(payload).subscribe({
        next: (res: BaseResponse<DeviceTypeList>) => {
          this.commonService.hideSpinner();
          if (res && res.status.code === 0) {
            this.close.emit(true);
            this.commonService.hideSpinner();
            this.commonService.manageStatus(res.status);
          } else {
            this.commonService.hideSpinner();
            this.commonService.manageStatus(res.status);
          }
        },
        error: (err) => {
          this.commonService.hideSpinner();
          this.toastr.error(err.error?.message || 'An error occurred while creating device type');
        },
      });
    }
  }

  onCancel(): void {
    this.close.emit(false);
  }
}
