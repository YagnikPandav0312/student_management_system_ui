import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameTypeService } from '../../core/services/game-type';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditGametype } from './add-edit-game-type/add-edit-game-type';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { BaseResponse } from '../../model/api.model';
import { GameTypeList } from '../../model/game-type.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-game-type',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './game-type.html',
  styleUrl: './game-type.scss',
})
export class GameType implements OnInit {
  gameTypes = signal<GameTypeList[]>([]);
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalItems = signal<number>(0);
  sort_by = signal<string>('game_type_id');
  sort_order = signal<string>('DESC');

  showingFrom = computed(() => {
    if (this.gameTypes().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });
  showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  private gameTypeService = inject(GameTypeService);
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
      this.GetGameTypes();
    });
  }

  ngOnInit(): void {
    this.GetGameTypes();
  }

  GetGameTypes(): void {
    this.commonService.showSpinner();
    const pagination: any = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchQuery()?.trim() || '',
      sort_by: this.sort_by(),
      sort_order: this.sort_order()
    };
    this.gameTypeService.getGameTypes(pagination).subscribe({
      next: (res: BaseResponse<GameTypeList[]>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.gameTypes.set(res.data || []);
          this.totalItems.set(res.total_records || 0);
          this.commonService.hideSpinner();
        } else {
          this.commonService.manageStatus(res.status);
          this.commonService.hideSpinner();
        }
      },
      error: (err: any) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.message || 'Error occurred while loading game types');
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onPageChange(p: number): void {
    this.currentPage.set(p);
    this.GetGameTypes();
  }

  openFormModal(item?: GameTypeList): void {
    const modalRef = this.modalService.open(AddEditGametype, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.gameType = item;
    modalRef.componentInstance.close.subscribe((isSaved?: boolean) => {
      if (isSaved) {
        this.GetGameTypes();
      }
      modalRef.close();
    });
  }

  onDeleteGameType(gameType: GameTypeList): void {
    const modalRef = this.modalService.open(Confirm, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.title = 'Delete Game Type';
    modalRef.componentInstance.message = `Are you sure you want to delete "${gameType.game_type_name}"?`;
    modalRef.componentInstance.onClose.subscribe((returnData: any) => {
      if (returnData) {
        this.commonService.showSpinner();
        this.gameTypeService.deleteGameType(gameType.game_type_id).subscribe({
          next: (res: BaseResponse<any>) => {
            this.commonService.hideSpinner();
            if (res.status.code === 0) {
              this.commonService.manageStatus(res.status);
              if (this.gameTypes().length === 1 && this.currentPage() > 1) {
                this.currentPage.update(p => p - 1);
              }
              this.GetGameTypes();
              this.commonService.hideSpinner();
            } else {
              this.commonService.manageStatus(res.status);
              this.commonService.hideSpinner();
            }
          },
          error: (err) => {
            this.commonService.hideSpinner();
            this.toastr.error(err.error?.message || 'Error occurred while deleting game type');
          },
        });
      }
      modalRef.close();
    });
  }

  onToggleStatus(gameType: GameTypeList): void {
    const newStatus = !gameType.is_active;
    this.commonService.showSpinner();
    this.gameTypeService.updateGameTypeStatus(gameType.game_type_id, newStatus).subscribe({
      next: (res: BaseResponse<any>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.commonService.manageStatus(res.status);
          this.GetGameTypes();
        } else {
          this.commonService.manageStatus(res.status);
        }
      },
      error: (err) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.message || 'Error occurred while updating game type status');
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
    this.GetGameTypes();
  }
}
