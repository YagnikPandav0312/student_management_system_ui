import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';
import { environment } from '../../../environment/environment';
import { ProviderList } from '../../model/provider.model';
import { BaseResponse } from '../../model/api.model';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getProviders(pagination?: any): Observable<BaseResponse<ProviderList[]>> {
    return this.http.post<BaseResponse<ProviderList[]>>(`${this.baseUrl}${API.providers_api.get_providers}`, pagination || {});
  }

  getProviderById(id: number | string): Observable<BaseResponse<ProviderList>> {
    return this.http.get<BaseResponse<ProviderList>>(`${this.baseUrl}${API.providers_api.get_provider_by_id}/${id}`);
  }

  createProvider(formData: FormData): Observable<BaseResponse<ProviderList>> {
    return this.http.post<BaseResponse<ProviderList>>(`${this.baseUrl}${API.providers_api.create_providers}`, formData);
  }

  updateProvider(id: number | string, formData: FormData): Observable<BaseResponse<ProviderList>> {
    return this.http.put<BaseResponse<ProviderList>>(`${this.baseUrl}${API.providers_api.update_providers}/${id}`, formData);
  }

  deleteProvider(id: number | string): Observable<BaseResponse<any>> {
    return this.http.delete<BaseResponse<any>>(`${this.baseUrl}${API.providers_api.delete_provider}/${id}`);
  }

  updateProviderStatus(id: number | string, status: boolean): Observable<BaseResponse<any>> {
    return this.http.put<BaseResponse<any>>(`${this.baseUrl}${API.providers_api.update_provider_status}/${id}`, { is_active: status });
  }
}
