import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';
import { environment } from '../../../environment/environment';
import { GameList } from '../../model/game.model';
import { BaseResponse } from '../../model/api.model';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getGames(): Observable<BaseResponse<GameList[]>> {
    return this.http.get<BaseResponse<GameList[]>>(`${this.baseUrl}${API.games_api.get_games}`);
  }

  getGameById(id: number | string): Observable<BaseResponse<GameList>> {
    return this.http.get<BaseResponse<GameList>>(`${this.baseUrl}${API.games_api.get_game_by_id}/${id}`);
  }

  createGame(payload: FormData): Observable<BaseResponse<GameList>> {
    return this.http.post<BaseResponse<GameList>>(`${this.baseUrl}${API.games_api.create_game}`, payload);
  }

  updateGame(id: number | string, payload: FormData): Observable<BaseResponse<GameList>> {
    return this.http.put<BaseResponse<GameList>>(`${this.baseUrl}${API.games_api.update_game}/${id}`, payload);
  }

  deleteGame(id: number | string): Observable<BaseResponse<any>> {
    return this.http.delete<BaseResponse<any>>(`${this.baseUrl}${API.games_api.delete_game}/${id}`);
  }
}
