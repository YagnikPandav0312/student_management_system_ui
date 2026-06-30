import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameTypeService } from '../../core/services/game-type';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditGametype } from './add-edit-gametype/add-edit-gametype';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-game-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-type.html',
  styleUrl: './game-type.scss',
})
export class GameType implements OnInit {
  gameTypes = signal<any[]>([]);
  searchQuery = signal<string>('');

  private gameTypeService = inject(GameTypeService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);

  filteredGameTypes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.gameTypes();
    }
    return this.gameTypes().filter(
      (gt) =>
        (gt.game_type_name && gt.game_type_name.toLowerCase().includes(query)) ||
        (gt.slug && gt.slug.toLowerCase().includes(query))
    );
  });

  ngOnInit(): void {
    this.loadGameTypes();
  }

  loadGameTypes(): void {
    this.commonService.showSpinner();
    this.gameTypeService.getGameTypes().subscribe({
      next: (res) => {
        this.commonService.hideSpinner();
        if (res.success) {
          this.gameTypes.set(res.data || []);
        } else {
          this.toastr.error(res.message || 'Failed to fetch game types');
        }
      },
      error: (err) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.message || 'Error occurred while loading game types');
      },
    });
  }

  openFormModal(item?: any): void {
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

  onDeleteGameType(gameType: any): void {
    if (confirm(`Are you sure you want to delete "${gameType.game_type_name}"?`)) {
      this.commonService.showSpinner();
      this.gameTypeService.deleteGameType(gameType.game_type_id).subscribe({
        next: (res) => {
          this.commonService.hideSpinner();
          if (res.success) {
            this.toastr.success(res.message || 'Game type deleted successfully');
            this.loadGameTypes();
          } else {
            this.toastr.error(res.message || 'Failed to delete game type');
          }
        },
        error: (err) => {
          this.commonService.hideSpinner();
          this.toastr.error(err.error?.message || 'Error occurred while deleting game type');
        },
      });
    }
  }
}
