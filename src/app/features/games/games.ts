import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
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
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseResponse } from '../../model/api.model';
import { GameList } from '../../model/game.model';
import { ProviderList } from '../../model/provider.model';
import { GameCategoryList } from '../../model/game-category.model';
import { GameTypeList } from '../../model/game-type.model';
import { DeviceTypeList } from '../../model/device-type.model';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './games.html',
  styleUrl: './games.scss',
})
export class Games implements OnInit {
  games = signal<GameList[]>([]);
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalItems = signal<number>(0);
  sort_by = signal<string>('game_id');
  sort_order = signal<string>('DESC');

  showingFrom = computed(() => {
    if (this.games().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });
  showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

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
  private destroyRef = inject(DestroyRef);
  public role = signal('');
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.GetGames();
    });
  }

  ngOnInit(): void {
    this.GetGames();
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.full_name) {
          this.role.set(user.role);
        }
      }
    } catch (e) {
      console.error('Failed to parse user details', e);
  }
  }

  GetGames(): void {
    this.commonService.showSpinner();
    forkJoin({
      providers: this.providerService.getProviderDdl({ user_id: this.commonService.getUserId() || 0 }),
      categories: this.gameCategoryService.getGameCategoryDdl({ user_id: this.commonService.getUserId() || 0 }),
      gameTypes: this.gameTypeService.getGameTypeDdl({ user_id: this.commonService.getUserId() || 0 }),
      deviceTypes: this.deviceTypeService.getDeviceTypeDdl({ user_id: this.commonService.getUserId() || 0 }),
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
    this.commonService.showSpinner();
    const pagination: any = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchQuery()?.trim() || '',
      sort_by: this.sort_by(),
      sort_order: this.sort_order(),
      user_id: this.commonService.getUserId() || 0
    };
    this.gameService.getGames(pagination).subscribe({
      next: (res: BaseResponse<GameList[]>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.games.set(res.data || []);
          this.totalItems.set(res.total_records || 0);
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

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onPageChange(p: number): void {
    this.currentPage.set(p);
    this.loadGames();
  }

  getProviderName(id: number): string {
    return this.providersMap.get(id) || 'Unknown';
  }

  getCategoryName(id: any): string {
    if (!id) return '-';
    if (Array.isArray(id)) {
      return id.map(item => this.categoriesMap.get(item) || 'Unknown').join(', ');
    }
    return this.categoriesMap.get(id) || 'Unknown';
  }

  getGameTypeName(id: any): string {
    if (!id) return '-';
    if (Array.isArray(id)) {
      return id.map(item => this.gameTypesMap.get(item) || 'Unknown').join(', ');
    }
    return this.gameTypesMap.get(id) || 'Unknown';
  }

  getDeviceTypeName(id: any): string {
    if (!id) return '-';
    if (Array.isArray(id)) {
      return id.map(item => this.deviceTypesMap.get(item) || 'Unknown').join(', ');
    }
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
        this.loadGames();
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
        const payload: any = {
          game_id: game.game_id,
          user_id: this.commonService.getUserId() || 0,
        };
        this.gameService.deleteGame(payload).subscribe({
          next: (res: BaseResponse<any>) => {
            this.commonService.hideSpinner();
            if (res.status.code === 0) {
              this.commonService.manageStatus(res.status);
              if (this.games().length === 1 && this.currentPage() > 1) {
                this.currentPage.update(p => p - 1);
              }
              this.loadGames();
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

  onToggleStatus(game: GameList): void {
    this.commonService.showSpinner();
    const payload: any = {
      game_id: game.game_id,
      status: !game.is_active,
      user_id: this.commonService.getUserId() || 0,
    };
    this.gameService.updateGameStatus(payload).subscribe({
      next: (res: BaseResponse<any>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.commonService.manageStatus(res.status);
          this.loadGames(); // just reload games list, don't need to fetch lookups again
        } else {
          this.commonService.manageStatus(res.status);
        }
      },
      error: (err) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.message || 'Error occurred while updating game status');
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
    this.loadGames();
  }
}

