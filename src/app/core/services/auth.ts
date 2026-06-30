import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginRequest } from '../../model/auth.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class Auth {

  private baseUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) { }

  login(data: LoginRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }
}
