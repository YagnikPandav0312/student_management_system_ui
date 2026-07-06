import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class GameCategoryService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getGameCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}${API.game_category_api.get_game_category}`);
  }

  getGameCategoryById(id: number | string): Observable<any> {
    return this.http.get(`${this.baseUrl}${API.game_category_api.get_game_category_by_id}/${id}`);
  }

  createGameCategory(payload: { game_categorie_name: string; slug: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}${API.game_category_api.create_game_category}`, payload);
  }

  updateGameCategory(id: number | string, payload: { game_categorie_name: string; slug: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}${API.game_category_api.update_game_category}/${id}`, payload);
  }

  deleteGameCategory(id: number | string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${API.game_category_api.delete_game_category}/${id}`);
  }
}
