import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class GameTypeService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

  getGameTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}${API.game_type_api.get_game_type}`);
  }

  getGameTypeById(id: number | string): Observable<any> {
    return this.http.get(`${this.baseUrl}${API.game_type_api.get_game_type_by_id}/${id}`);
  }

  createGameType(payload: { game_types_name: string; slug: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}${API.game_type_api.create_game_type}`, payload);
  }

  updateGameType(id: number | string, payload: { game_types_name: string; slug: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}${API.game_type_api.update_game_type}/${id}`, payload);
  }

  deleteGameType(id: number | string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${API.game_type_api.delete_game_type}/${id}`);
  }
}
