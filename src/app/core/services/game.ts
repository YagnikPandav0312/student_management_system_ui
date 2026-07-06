import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getGames(): Observable<any> {
    return this.http.get(`${this.baseUrl}${API.games_api.get_games}`);
  }

  getGameById(id: number | string): Observable<any> {
    return this.http.get(`${this.baseUrl}${API.games_api.get_game_by_id}/${id}`);
  }

  createGame(payload: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}${API.games_api.create_game}`, payload);
  }

  updateGame(id: number | string, payload: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}${API.games_api.update_game}/${id}`, payload);
  }

  deleteGame(id: number | string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${API.games_api.delete_game}/${id}`);
  }
}
