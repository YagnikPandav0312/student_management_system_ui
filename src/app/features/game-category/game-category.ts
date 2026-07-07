import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameCategoryService } from '../../core/services/game-category';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditGameCategory } from './add-edit-game-category/add-edit-game-category';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { BaseResponse } from '../../model/api.model';
import { GameCategoryList } from '../../model/game-category.model';

@Component({
  selector: 'app-game-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-category.html',
  styleUrl: './game-category.scss',
})
export class GameCategory implements OnInit {
  gameCategories = signal<GameCategoryList[]>([]);
  searchQuery = signal<string>('');

  private gameCategoryService = inject(GameCategoryService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);

  filteredGameCategories = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.gameCategories();
    return this.gameCategories().filter(c => 
      c.game_categorie_name.toLowerCase().includes(query) ||
      (c.slug && c.slug.toLowerCase().includes(query))
    );
  });

  ngOnInit(): void {
    this.loadGameCategories();
  }

  loadGameCategories(): void {
    this.commonService.showSpinner();
    this.gameCategoryService.getGameCategories().subscribe({
      next: (res: BaseResponse<GameCategoryList[]>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.gameCategories.set(res.data || []);
          this.commonService.hideSpinner();
        } else {
          this.commonService.manageStatus(res.status);
          this.commonService.hideSpinner();
        }
      },
      error: (err: any) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.message || 'Error occurred while loading game categories');
      },
    });
  }

  openFormModal(item?: GameCategoryList): void {
    const modalRef = this.modalService.open(AddEditGameCategory, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.gameCategory = item;
    modalRef.componentInstance.close.subscribe((isSaved?: boolean) => {
      if (isSaved) {
        this.loadGameCategories();
      }
      modalRef.close();
    });
  }

  onDeleteGameCategory(gameCategory: GameCategoryList): void {
    const modalRef = this.modalService.open(Confirm, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.title = 'Delete Game Category';
    modalRef.componentInstance.message = `Are you sure you want to delete "${gameCategory.game_categorie_name}"?`;
    modalRef.componentInstance.onClose.subscribe((returnData: any) => {
      if (returnData) {
        this.commonService.showSpinner();
        this.gameCategoryService.deleteGameCategory(gameCategory.game_categorie_id).subscribe({
          next: (res: BaseResponse<any>) => {
            this.commonService.hideSpinner();
            if (res.status.code === 0) {
              this.loadGameCategories();
              this.commonService.manageStatus(res.status);
              this.commonService.hideSpinner();
            } else {
              this.commonService.manageStatus(res.status);
              this.commonService.hideSpinner();
            }
          },
          error: (err) => {
            this.commonService.hideSpinner();
            this.toastr.error(err.error?.message || 'Error occurred while deleting game category');
          },
        });
      }
      modalRef.close();
    });
  }
}
