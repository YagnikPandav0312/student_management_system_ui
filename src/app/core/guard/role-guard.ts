import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const roleId = Number(localStorage.getItem('role_id'));

  const expectedRole = route.data['role'];

  if (roleId === expectedRole) {
    return true;
  }

  return inject(Router).createUrlTree(['/login']);
};
