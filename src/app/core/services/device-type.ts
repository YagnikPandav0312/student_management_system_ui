import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';
import { environment } from '../../../environment/environment';
import { DeviceTypeList } from '../../model/device-type.model';
import { BaseResponse } from '../../model/api.model';

@Injectable({
  providedIn: 'root',
})
export class DeviceTypeService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getDeviceTypes(): Observable<BaseResponse<DeviceTypeList[]>> {
    return this.http.get<BaseResponse<DeviceTypeList[]>>(`${this.baseUrl}${API.device_type_api.get_device_type}`);
  }

  getDeviceTypeById(id: number | string): Observable<BaseResponse<DeviceTypeList>> {
    return this.http.get<BaseResponse<DeviceTypeList>>(`${this.baseUrl}${API.device_type_api.get_device_type_by_id}/${id}`);
  }

  createDeviceType(payload: { device_type_name: string; slug: string }): Observable<BaseResponse<DeviceTypeList>> {
    return this.http.post<BaseResponse<DeviceTypeList>>(`${this.baseUrl}${API.device_type_api.create_device_type}`, payload);
  }

  updateDeviceType(id: number | string, payload: { device_type_name: string; slug: string }): Observable<BaseResponse<DeviceTypeList>> {
    return this.http.put<BaseResponse<DeviceTypeList>>(`${this.baseUrl}${API.device_type_api.update_device_type}/${id}`, payload);
  }

  deleteDeviceType(id: number | string): Observable<BaseResponse<any>> {
    return this.http.delete<BaseResponse<any>>(`${this.baseUrl}${API.device_type_api.delete_device_type}/${id}`);
  }
}
