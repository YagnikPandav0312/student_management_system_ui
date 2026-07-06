import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProviderService } from '../../../core/services/provider';
import { Common } from '../../../core/services/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-edit-providers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-providers.html',
  styleUrl: './add-edit-providers.scss',
})

export class AddEditProviders implements OnInit {
  @Input() provider: any = null;
  @Output() close = new EventEmitter<boolean>();

  form!: FormGroup;
  submitted = signal<boolean>(false);
  logoPreview = signal<string | null>(null);
  selectedFile: File | null = null;
  isEditMode = signal<boolean>(false);

  private fb = inject(FormBuilder);
  private providerService = inject(ProviderService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.initForm();
    if (this.provider) {
      this.isEditMode.set(true);
      this.form.patchValue({
        provider_name: this.provider.provider_name,
        slug: this.provider.slug || '',
      });
      if (this.provider.logo) {
        if (this.provider.logo.startsWith('http') || this.provider.logo.startsWith('data:')) {
          this.logoPreview.set(this.provider.logo);
        } else {
          this.logoPreview.set(`${this.provider.logo}`);
        } 
      } else {
        this.logoPreview.set(null);
      }
    } else {
      this.isEditMode.set(false);
      this.logoPreview.set(null);
      this.selectedFile = null;
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      provider_name: ['', [Validators.required, Validators.maxLength(100)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      logo: [null],
    });
    this.submitted.set(false);
    this.selectedFile = null;

    // Auto-generate slug from name if not in edit mode
    this.form.get('provider_name')?.valueChanges.subscribe(name => {
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
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start
      .replace(/-+$/, '');            // Trim - from end
  }

  get f() {
    return this.form.controls;
  }

  onFileChange(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('provider_name', this.form.get('provider_name')?.value);
    formData.append('slug', this.form.get('slug')?.value);
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    } else if (this.isEditMode() && this.provider.logo) {
      formData.append('logo', this.provider.logo);
    }

    this.commonService.showSpinner();
    if (this.isEditMode()) {
      this.providerService.updateProvider(this.provider.provider_id, formData).subscribe({
        next: (res) => {
          this.commonService.hideSpinner();
          if (res.success) {
            this.toastr.success(res.message || 'Provider updated successfully');
            this.close.emit(true);
          } else {
            this.toastr.error(res.message || 'Failed to update provider');
          }
        },
        error: (err) => {
          this.commonService.hideSpinner();
          this.toastr.error(err.error?.message || 'An error occurred while updating provider');
        },
      });
    } else {
      this.providerService.createProvider(formData).subscribe({
        next: (res) => {
          this.commonService.hideSpinner();
          if (res.success) {
            this.toastr.success(res.message || 'Provider created successfully');
            this.close.emit(true);
          } else {
            this.toastr.error(res.message || 'Failed to create provider');
          }
        },
        error: (err) => {
          this.commonService.hideSpinner();
          this.toastr.error(err.error?.message || 'An error occurred while creating provider');
        },
      });
    }
  }

  onCancel(): void {
    this.close.emit(false);
  }
}
