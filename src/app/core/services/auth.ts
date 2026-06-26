import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginRequest } from '../../model/auth.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private baseUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  getRole(): number {
    return Number(localStorage.getItem('role_id'));
  }

  isAdmin(): boolean {
    return this.getRole() === 1;
  }

  isTeacher(): boolean {
    return this.getRole() === 2;
  }

  isStudent(): boolean {
    return this.getRole() === 3;
  }

  login(data: LoginRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }
}
