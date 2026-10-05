import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionsStoreService } from '../services/permissions-store.service';

export const permissionGuard: CanActivateFn = (route) => {
  const permission = route.data['permission'] as string | undefined;
  if (!permission) {
    return true;
  }

  const permissionsStore = inject(PermissionsStoreService);
  if (permissionsStore.hasPermission(permission)) {
    return true;
  }

  const router = inject(Router);
  router.navigate(['/unauthorized']);
  return false;
};
