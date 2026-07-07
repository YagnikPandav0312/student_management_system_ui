import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameTypeService } from '../../core/services/game-type';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditGametype } from './add-edit-game-type/add-edit-game-type';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { BaseResponse } from '../../model/api.model';
import { GameTypeList } from '../../model/game-type.model';

@Component({
  selector: 'app-game-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-type.html',
  styleUrl: './game-type.scss',
})
export class GameType implements OnInit {
  gameTypes = signal<GameTypeList[]>([]);
  searchQuery = signal<string>('');

  private gameTypeService = inject(GameTypeService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);

  filteredGameTypes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.gameTypes();
    return this.gameTypes().filter(gt => 
      gt.game_type_name.toLowerCase().includes(query) ||
      (gt.slug && gt.slug.toLowerCase().includes(query))
    );
  });

  ngOnInit(): void {
    this.loadGameTypes();
  }

  loadGameTypes(): void {
    this.commonService.showSpinner();
    this.gameTypeService.getGameTypes().subscribe({
      next: (res: BaseResponse<GameTypeList[]>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.gameTypes.set(res.data || []);
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

  openFormModal(item?: GameTypeList): void {
    const modalRef = this.modalService.open(AddEditGametype, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.gameType = item;
    modalRef.componentInstance.close.subscribe((isSaved?: boolean) => {
      if (isSaved) {
        this.loadGameTypes();
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
              this.loadGameTypes();
              this.commonService.manageStatus(res.status);
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
}
