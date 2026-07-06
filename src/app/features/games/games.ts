import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../core/services/game';
import { ProviderService } from '../../core/services/provider';
import { GameTypeService } from '../../core/services/game-type';
import { GameCategoryService } from '../../core/services/game-category';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditGame } from './add-edit-game/add-edit-game';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './games.html',
  styleUrl: './games.scss',
})
export class Games implements OnInit {
  games = signal<any[]>([]);
  searchQuery = signal<string>('');

  providers = signal<any[]>([]);
  categories = signal<any[]>([]);
  gameTypes = signal<any[]>([]);

  providersMap = new Map<number, string>();
  categoriesMap = new Map<number, string>();
  gameTypesMap = new Map<number, string>();

  private gameService = inject(GameService);
  private providerService = inject(ProviderService);
  private gameCategoryService = inject(GameCategoryService);
  private gameTypeService = inject(GameTypeService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);

  filteredGames = computed(() => {
    return this.games();
  });

  ngOnInit(): void {
    this.loadLookupsAndGames();
  }

  loadLookupsAndGames(): void {
    this.commonService.showSpinner();
    forkJoin({
      providers: this.providerService.getProviders(),
      categories: this.gameCategoryService.getGameCategories(),
      gameTypes: this.gameTypeService.getGameTypes(),
    }).subscribe({
      next: (res: any) => {
        if (res.providers.success) {
          this.providers.set(res.providers.data || []);
          res.providers.data.forEach((p: any) => this.providersMap.set(p.provider_id, p.provider_name));
        }
        if (res.categories.success) {
          this.categories.set(res.categories.data || []);
          res.categories.data.forEach((c: any) => this.categoriesMap.set(c.game_categorie_id, c.game_categorie_name));
        }
        if (res.gameTypes.success) {
          this.gameTypes.set(res.gameTypes.data || []);
          res.gameTypes.data.forEach((gt: any) => this.gameTypesMap.set(gt.game_type_id, gt.game_type_name));
        }
        this.loadGames();
      },
      error: (err) => {
        this.commonService.hideSpinner();
        this.toastr.error('Failed to load initial lookups');
        this.loadGames();
      }
    });
  }

  loadGames(): void {
    this.gameService.getGames().subscribe({
      next: (res) => {
        this.commonService.hideSpinner();
        if (res.success) {
          this.games.set(res.data || []);
        } else {
          this.toastr.error(res.message || 'Failed to fetch games');
        }
      },
      error: (err) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.message || 'Error occurred while loading games');
      },
    });
  }

  getProviderName(id: number): string {
    return this.providersMap.get(id) || 'Unknown';
  }

  getCategoryName(id: number): string {
    return this.categoriesMap.get(id) || 'Unknown';
  }

  getGameTypeName(id: number): string {
    if (!id) return '-';
    return this.gameTypesMap.get(id) || 'Unknown';
  }

  openFormModal(item?: any): void {
    const modalRef = this.modalService.open(AddEditGame, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    modalRef.componentInstance.game = item;
    modalRef.componentInstance.providers = this.providers();
    modalRef.componentInstance.categories = this.categories();
    modalRef.componentInstance.gameTypes = this.gameTypes();
    
    modalRef.componentInstance.close.subscribe((isSaved?: boolean) => {
      if (isSaved) {
        this.loadLookupsAndGames();
      }
      modalRef.close();
    });
  }

  onDeleteGame(game: any): void {
    const modalRef = this.modalService.open(Confirm, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.title = 'Delete Game';
    modalRef.componentInstance.message = `Are you sure you want to delete "${game.game_name}"?`;
    modalRef.componentInstance.onClose.subscribe((returnData: any) => {
      if (returnData) {
        this.commonService.showSpinner();
        this.gameService.deleteGame(game.game_id).subscribe({
          next: (res) => {
            this.commonService.hideSpinner();
            if (res.success) {
              this.toastr.success(res.message || 'Game deleted successfully');
              this.loadLookupsAndGames();
            } else {
              this.toastr.error(res.message || 'Failed to delete game');
            }
          },
          error: (err) => {
            this.commonService.hideSpinner();
            this.toastr.error(err.error?.message || 'Error occurred while deleting game');
          },
        });
      }
      modalRef.close();
    });
  }
}
