import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionsStoreService } from '../services/permissions-store.service';

export const permissionGuard: CanActivateFn = (route) => {
  const permission = route.data['permission'] as string | string[] | undefined;
  if (!permission) {
    return true;
  }

  const permissionsStore = inject(PermissionsStoreService);
  const requiredPermissions = Array.isArray(permission) ? permission : [permission];
  if (permissionsStore.hasAnyPermission(requiredPermissions)) {
    return true;
  }

  const router = inject(Router);
  router.navigate(['/unauthorized']);
  return false;
};
