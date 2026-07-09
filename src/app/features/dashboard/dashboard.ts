import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard';
import { Common } from '../../core/services/common';
import { DashboardStatistics } from '../../model/dashboard.model';
import { BaseResponse } from '../../model/api.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  statistics = signal<DashboardStatistics | null>(null);
  fullName = signal<string>('Guest');
  today = new Date();

  activePercentage = computed(() => {
    const stats = this.statistics();
    if (!stats || !stats.total_games) return 0;
    return Math.round((stats.total_active_games / stats.total_games) * 100);
  });

  private dashboardService = inject(DashboardService);
  private commonService = inject(Common);

  ngOnInit(): void {
    this.getUserDetails();
    this.getStatistics();
  }

  private getUserDetails(): void {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.full_name) {
          this.fullName.set(user.full_name);
        }
      }
    } catch (e) {
      console.error('Failed to parse user details', e);
    }
  }

  getStatistics(): void {
    this.commonService.showSpinner();
    this.dashboardService.getStatistics().subscribe({
      next: (res: BaseResponse<DashboardStatistics>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.statistics.set(res.data);
        } else {
          this.commonService.manageStatus(res.status);
        }
      },
      error: (err) => {
        this.commonService.hideSpinner();
        console.error('Failed to load dashboard statistics', err);
      },
    });
  }
}
