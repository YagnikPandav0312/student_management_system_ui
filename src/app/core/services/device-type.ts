import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class DeviceTypeService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

  getDeviceTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}${API.device_type_api.get_device_type}`);
  }

  getDeviceTypeById(id: number | string): Observable<any> {
    return this.http.get(`${this.baseUrl}${API.device_type_api.get_device_type_by_id}/${id}`);
  }

  createDeviceType(payload: { device_type_name: string; slug: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}${API.device_type_api.create_device_type}`, payload);
  }

  updateDeviceType(id: number | string, payload: { device_type_name: string; slug: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}${API.device_type_api.update_device_type}/${id}`, payload);
  }

  deleteDeviceType(id: number | string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${API.device_type_api.delete_device_type}/${id}`);
  }
}
