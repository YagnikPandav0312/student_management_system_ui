import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../../core/services/auth';
import { Common } from '../../../core/services/common';
import { BaseResponse } from '../../../model/api.model';
import { loginResponse } from '../../../model/account.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm!: FormGroup;
  submitted = signal<boolean>(false);
  public commonService = inject(Common);
  private toastr = inject(ToastrService);

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      user_name: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.commonService.showSpinner();
    this.authService.login(this.loginForm.value).subscribe({
      next: (res: BaseResponse<loginResponse>) => {
        if (res && res.status.code === 0) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('role_id', res.data.role_id.toString());
          localStorage.setItem('user', JSON.stringify(res.data));
          this.redirectUser(res.data.role_id);
          this.submitted.set(false);
          this.commonService.hideSpinner();
          this.commonService.manageStatus(res.status);
        } else {
          this.commonService.hideSpinner();
          this.commonService.manageStatus(res.status);
        }
      },
      error: (err) => {
        this.toastr.error(err || 'Error User Login:', 'Error');
        this.commonService.hideSpinner();
        this.submitted.set(false);
      },
    });
  }

  redirectUser(roleId: number) {
    switch (roleId) {
      case 1:
        this.router.navigate(['/admin/dashboard']);
        break;

      case 2:
        this.router.navigate(['/teacher/dashboard']);
        break;

      case 3:
        this.router.navigate(['/student/dashboard']);
        break;

      default:
        this.router.navigate(['/login']);
        break;
    }
  }
}
