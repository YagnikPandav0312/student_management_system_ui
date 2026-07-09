import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';
import { environment } from '../../../environment/environment';
import { DashboardStatistics } from '../../model/dashboard.model';
import { BaseResponse } from '../../model/api.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getStatistics(): Observable<BaseResponse<DashboardStatistics>> {
    return this.http.get<BaseResponse<DashboardStatistics>>(`${this.baseUrl}${API.dashboard_api.get_statistics}`);
  }
}
