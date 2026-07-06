import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getProviders(): Observable<any> {
    return this.http.get(`${this.baseUrl}${API.providers_api.get_providers}`);
  }

  getProviderById(id: number | string): Observable<any> {
    return this.http.get(`${this.baseUrl}${API.providers_api.get_provider_by_id}/${id}`);
  }

  createProvider(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}${API.providers_api.create_providers}`, formData);
  }

  updateProvider(id: number | string, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}${API.providers_api.update_providers}/${id}`, formData);
  }

  deleteProvider(id: number | string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${API.providers_api.delete_provider}/${id}`);
  }
}
