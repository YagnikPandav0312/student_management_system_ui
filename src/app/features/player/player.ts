import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../core/services/player';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditPlayer } from './add-edit-player/add-edit-player';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { BaseResponse } from '../../model/api.model';
import { PlayerList } from '../../model/player.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './player.html',
  styleUrl: './player.scss',
})
export class Player implements OnInit {
  players = signal<PlayerList[]>([]);
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalItems = signal<number>(0);
  sort_by = signal<string>('player_id');
  sort_order = signal<string>('DESC');

  showingFrom = computed(() => {
    if (this.players().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });
  showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  private playerService = inject(PlayerService);
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
      this.GetPlayerList();
    });
  }

  ngOnInit(): void {
    this.GetPlayerList();
  }

  GetPlayerList(): void {
    this.commonService.showSpinner();
    const pagination: any = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchQuery()?.trim() || '',
      sort_by: this.sort_by(),
      sort_order: this.sort_order()?.toLowerCase() || 'desc',
      user_id: this.commonService.getUserId() || 0
    };
    this.playerService.getPlayers(pagination).subscribe({
      next: (res: BaseResponse<PlayerList[]>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.players.set(res.data || []);
          this.totalItems.set(res.total_records || 0);
        } else {
          this.commonService.hideSpinner();
          this.commonService.manageStatus(res.status);
        }
      },
      error: (err: any) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.message || 'Error occurred while loading players');
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onPageChange(p: number): void {
    this.currentPage.set(p);
    this.GetPlayerList();
  }

  openFormModal(item?: any): void {
    const modalRef = this.modalService.open(AddEditPlayer, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.player = item;
    modalRef.componentInstance.close.subscribe((isSaved?: boolean) => {
      if (isSaved) {
        this.GetPlayerList();
      }
      modalRef.close();
    });
  }

  onDeletePlayer(player: PlayerList): void {
    const modalRef = this.modalService.open(Confirm, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.title = 'Delete Player';
    modalRef.componentInstance.message = `Are you sure you want to delete "${player.full_name}"?`;
    modalRef.componentInstance.onClose.subscribe((returnData: any) => {
      if (returnData) {
        this.commonService.showSpinner();
        const payload: any = {
          id: player.player_id,
          user_id: this.commonService.getUserId() || 0,
        };
        this.playerService.deletePlayer(payload).subscribe({
          next: (res: BaseResponse<any>) => {
            this.commonService.hideSpinner();
            if (res.status.code === 0) {
              this.commonService.manageStatus(res.status);
              if (this.players().length === 1 && this.currentPage() > 1) {
                this.currentPage.update(p => p - 1);
              }
              this.GetPlayerList();
            } else {
              this.commonService.manageStatus(res.status);
            }
          },
          error: (err) => {
            this.commonService.hideSpinner();
            this.toastr.error(err.error?.message || 'Error occurred while deleting player');
          },
        });
      }
      modalRef.close();
    });
  }

  onToggleStatus(player: PlayerList): void {
    this.commonService.showSpinner();
    const payload: any = {
      id: player.player_id!,
      status: !player.is_active,
      user_id: this.commonService.getUserId() || 0,
    };
    this.playerService.updatePlayerStatus(payload).subscribe({
      next: (res: BaseResponse<any>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.commonService.manageStatus(res.status);
          this.GetPlayerList();
        } else {
          this.commonService.manageStatus(res.status);
        }
      },
      error: (err) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.message || 'Error occurred while updating player status');
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
    this.GetPlayerList();
  }
}
