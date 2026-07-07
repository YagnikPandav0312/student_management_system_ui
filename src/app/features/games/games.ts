import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../core/services/game';
import { ProviderService } from '../../core/services/provider';
import { GameTypeService } from '../../core/services/game-type';
import { GameCategoryService } from '../../core/services/game-category';
import { DeviceTypeService } from '../../core/services/device-type';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditGame } from './add-edit-game/add-edit-game';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { forkJoin } from 'rxjs';
import { BaseResponse } from '../../model/api.model';
import { GameList } from '../../model/game.model';
import { ProviderList } from '../../model/provider.model';
import { GameCategoryList } from '../../model/game-category.model';
import { GameTypeList } from '../../model/game-type.model';
import { DeviceTypeList } from '../../model/device-type.model';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './games.html',
  styleUrl: './games.scss',
})
export class Games implements OnInit {
  games = signal<GameList[]>([]);
  searchQuery = signal<string>('');

  providers = signal<ProviderList[]>([]);
  categories = signal<GameCategoryList[]>([]);
  gameTypes = signal<GameTypeList[]>([]);
  deviceTypes = signal<DeviceTypeList[]>([]);

  providersMap = new Map<number, string>();
  categoriesMap = new Map<number, string>();
  gameTypesMap = new Map<number, string>();
  deviceTypesMap = new Map<number, string>();

  private gameService = inject(GameService);
  private providerService = inject(ProviderService);
  private gameCategoryService = inject(GameCategoryService);
  private gameTypeService = inject(GameTypeService);
  private deviceTypeService = inject(DeviceTypeService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);

  filteredGames = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.games();
    return this.games().filter(g => 
      (g.game_name && g.game_name.toLowerCase().includes(query)) ||
      (g.slug && g.slug.toLowerCase().includes(query)) ||
      (this.getProviderName(g.provider_id).toLowerCase().includes(query)) ||
      (this.getGameTypeName(g.game_type_id).toLowerCase().includes(query)) ||
      (this.getDeviceTypeName(g.device_type_id).toLowerCase().includes(query))
    );
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
      deviceTypes: this.deviceTypeService.getDeviceTypes(),
    }).subscribe({
      next: (res: any) => {
        if (res.providers && res.providers.status && res.providers.status.code === 0) {
          this.providers.set(res.providers.data || []);
          res.providers.data.forEach((p: any) => this.providersMap.set(p.provider_id, p.provider_name));
        }
        if (res.categories && res.categories.status && res.categories.status.code === 0) {
          this.categories.set(res.categories.data || []);
          res.categories.data.forEach((c: any) => this.categoriesMap.set(c.game_categorie_id, c.game_categorie_name));
        }
        if (res.gameTypes && res.gameTypes.status && res.gameTypes.status.code === 0) {
          this.gameTypes.set(res.gameTypes.data || []);
          res.gameTypes.data.forEach((gt: any) => this.gameTypesMap.set(gt.game_type_id, gt.game_type_name));
        }
        if (res.deviceTypes && res.deviceTypes.status && res.deviceTypes.status.code === 0) {
          this.deviceTypes.set(res.deviceTypes.data || []);
          res.deviceTypes.data.forEach((dt: any) => this.deviceTypesMap.set(dt.device_type_id, dt.device_type_name));
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
      next: (res: BaseResponse<GameList[]>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.games.set(res.data || []);
        } else {
          this.commonService.manageStatus(res.status);
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

  getDeviceTypeName(id: number): string {
    if (!id) return '-';
    return this.deviceTypesMap.get(id) || 'Unknown';
  }

  openFormModal(item?: GameList): void {
    const modalRef = this.modalService.open(AddEditGame, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    modalRef.componentInstance.game = item;
    modalRef.componentInstance.providers = this.providers();
    modalRef.componentInstance.categories = this.categories();
    modalRef.componentInstance.gameTypes = this.gameTypes();
    modalRef.componentInstance.deviceTypes = this.deviceTypes();
    
    modalRef.componentInstance.close.subscribe((isSaved?: boolean) => {
      if (isSaved) {
        this.loadLookupsAndGames();
      }
      modalRef.close();
    });
  }

  onDeleteGame(game: GameList): void {
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
          next: (res: BaseResponse<any>) => {
            this.commonService.hideSpinner();
            if (res.status.code === 0) {
              this.commonService.manageStatus(res.status);
              this.loadLookupsAndGames();
            } else {
              this.commonService.manageStatus(res.status);
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
