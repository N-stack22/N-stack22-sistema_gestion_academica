import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../interfaces/role';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed = route.data['roles'] as Role[] | undefined;

  if (!allowed?.length) {
    return true;
  }

  const role = auth.currentUser()?.role;
  if (role && allowed.includes(role)) {
    return true;
  }

  return router.createUrlTree(['/admin/dashboard'], {
    queryParams: { denied: '1' },
  });
};
