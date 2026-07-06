import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameCategoryService } from '../../../core/services/game-category';
import { Common } from '../../../core/services/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-edit-game-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-game-category.html',
  styleUrl: './add-edit-game-category.scss',
})
export class AddEditGameCategory implements OnInit {
  @Input() gameCategory: any = null;
  @Output() close = new EventEmitter<boolean>();

  form!: FormGroup;
  submitted = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  private fb = inject(FormBuilder);
  private gameCategoryService = inject(GameCategoryService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.initForm();
    if (this.gameCategory) {
      this.isEditMode.set(true);
      this.form.patchValue({
        game_categorie_name: this.gameCategory.game_categorie_name,
        slug: this.gameCategory.slug || '',
      });
    } else {
      this.isEditMode.set(false);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      game_categorie_name: ['', [Validators.required, Validators.maxLength(100)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    });
    this.submitted.set(false);

    // Auto-generate slug from name if not in edit mode
    this.form.get('game_categorie_name')?.valueChanges.subscribe(name => {
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

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      game_categorie_name: this.form.get('game_categorie_name')?.value,
      slug: this.form.get('slug')?.value,
    };

    this.commonService.showSpinner();
    if (this.isEditMode()) {
      this.gameCategoryService.updateGameCategory(this.gameCategory.game_categorie_id, payload).subscribe({
        next: (res) => {
          this.commonService.hideSpinner();
          if (res.success) {
            this.toastr.success(res.message || 'Game category updated successfully');
            this.close.emit(true);
          } else {
            this.toastr.error(res.message || 'Failed to update game category');
          }
        },
        error: (err) => {
          this.commonService.hideSpinner();
          this.toastr.error(err.error?.message || 'An error occurred while updating game category');
        },
      });
    } else {
      this.gameCategoryService.createGameCategory(payload).subscribe({
        next: (res) => {
          this.commonService.hideSpinner();
          if (res.success) {
            this.toastr.success(res.message || 'Game category created successfully');
            this.close.emit(true);
          } else {
            this.toastr.error(res.message || 'Failed to create game category');
          }
        },
        error: (err) => {
          this.commonService.hideSpinner();
          this.toastr.error(err.error?.message || 'An error occurred while creating game category');
        },
      });
    }
  }

  onCancel(): void {
    this.close.emit(false);
  }
}
