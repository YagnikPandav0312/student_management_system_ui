import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameCategoryService } from '../../core/services/game-category';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditGameCategory } from './add-edit-game-category/add-edit-game-category';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { BaseResponse } from '../../model/api.model';
import { GameCategoryList } from '../../model/game-category.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-game-category',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './game-category.html',
  styleUrl: './game-category.scss',
})
export class GameCategory implements OnInit {
  gameCategories = signal<GameCategoryList[]>([]);
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalItems = signal<number>(0);
  sort_by = signal<string>('game_categorie_id');
  sort_order = signal<string>('DESC');

  showingFrom = computed(() => {
    if (this.gameCategories().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });
  showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  private gameCategoryService = inject(GameCategoryService);
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
      this.GetGameCategories();
    });
  }

  ngOnInit(): void {
    this.GetGameCategories();
  }

  GetGameCategories(): void {
    this.commonService.showSpinner();
    const pagination: any = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchQuery()?.trim() || '',
      sort_by: this.sort_by(),
      sort_order: this.sort_order(),
      user_id: this.commonService.getUserId() || 0
    };
    this.gameCategoryService.getGameCategories(pagination).subscribe({
      next: (res: BaseResponse<GameCategoryList[]>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.gameCategories.set(res.data || []);
          this.totalItems.set(res.total_records || 0);
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

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onPageChange(p: number): void {
    this.currentPage.set(p);
    this.GetGameCategories();
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
        this.GetGameCategories();
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
        const payload: any = {
          game_categorie_id: gameCategory.game_categorie_id,
          user_id: this.commonService.getUserId() || 0,
        };
        this.gameCategoryService.deleteGameCategory(payload).subscribe({
          next: (res: BaseResponse<any>) => {
            this.commonService.hideSpinner();
            if (res.status.code === 0) {
              this.commonService.manageStatus(res.status);
              if (this.gameCategories().length === 1 && this.currentPage() > 1) {
                this.currentPage.update(p => p - 1);
              }
              this.GetGameCategories();
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

  onToggleStatus(gameCategory: GameCategoryList): void {
    this.commonService.showSpinner();
    const payload: any = {
      game_categorie_id: gameCategory.game_categorie_id,
      status: !gameCategory.is_active,
      user_id: this.commonService.getUserId() || 0,
    };
    this.gameCategoryService.updateGameCategoryStatus(payload).subscribe({
      next: (res: BaseResponse<any>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.commonService.manageStatus(res.status);
          this.GetGameCategories();
        } else {
          this.commonService.manageStatus(res.status);
        }
      },
      error: (err) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.message || 'Error occurred while updating game category status');
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
    this.GetGameCategories();
  }
}
