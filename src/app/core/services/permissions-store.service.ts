import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ILoginResponseData } from '../interfaces/ILoginResponse';

@Injectable({
  providedIn: 'root'
})
export class PermissionsStoreService {

  private rolesSubject = new BehaviorSubject<string[]>([]);
  private permissionsSubject = new BehaviorSubject<string[]>(this.leerPermisosIniciales());

  roles$: Observable<string[]> = this.rolesSubject.asObservable();
  permissions$: Observable<string[]> = this.permissionsSubject.asObservable();

  constructor() {
    this.rolesSubject.next(this.leerRolesIniciales());
  }

  // Se autoinicializa leyendo la ultima sesion guardada para evitar el
  // parpadeo del menu mientras /api/auth/me resuelve al recargar la pagina.
  private leerAuthGuardado(): ILoginResponseData | null {
    const raw = localStorage.getItem('dex24Auth');
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as ILoginResponseData;
    } catch {
      return null;
    }
  }

  private leerPermisosIniciales(): string[] {
    return this.leerAuthGuardado()?.permissions ?? [];
  }

  private leerRolesIniciales(): string[] {
    return this.leerAuthGuardado()?.roles ?? [];
  }

  hasPermission(code: string): boolean {
    return this.permissionsSubject.value.includes(code);
  }

  hasAnyPermission(codes: string[]): boolean {
    return codes.some(code => this.hasPermission(code));
  }

  setSession(roles: string[], permissions: string[]): void {
    this.rolesSubject.next(roles ?? []);
    this.permissionsSubject.next(permissions ?? []);
  }

  clear(): void {
    this.rolesSubject.next([]);
    this.permissionsSubject.next([]);
  }

}
