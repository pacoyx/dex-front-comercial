import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../../../core/interfaces/IShared';
import {
  ICreateRoleRequest,
  IPermission,
  IRole,
  IRolePermissionsResponse,
  IUpdateRolePermissionsRequest,
  IUpdateRoleRequest,
  IUpdateUserRolesRequest,
  IUserRolesResponse,
} from '../../../core/interfaces/IRbac';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private apiUrl = environment.apiUrlBase;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  listarRoles(isActive?: boolean): Observable<IResponseGeneric<IRole[]>> {
    const params: Record<string, string> = {};
    if (isActive !== undefined) {
      params['isActive'] = String(isActive);
    }
    return this.http.get<IResponseGeneric<IRole[]>>(`${this.apiUrl}${environment.EPRoles}`, { headers: this.headers, params });
  }

  crearRol(req: ICreateRoleRequest): Observable<IResponseGeneric<IRole>> {
    return this.http.post<IResponseGeneric<IRole>>(`${this.apiUrl}${environment.EPRoles}`, req, { headers: this.headers });
  }

  actualizarRol(id: number, req: IUpdateRoleRequest): Observable<IResponseGeneric<IRole>> {
    return this.http.put<IResponseGeneric<IRole>>(`${this.apiUrl}${environment.EPRoles}/${id}`, req, { headers: this.headers });
  }

  eliminarRol(id: number): Observable<IResponseGeneric<string>> {
    return this.http.delete<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPRoles}/${id}`, { headers: this.headers });
  }

  listarPermisos(): Observable<IResponseGeneric<IPermission[]>> {
    return this.http.get<IResponseGeneric<IPermission[]>>(`${this.apiUrl}${environment.EPPermissions}`, { headers: this.headers });
  }

  obtenerPermisosDeRol(roleId: number): Observable<IResponseGeneric<IRolePermissionsResponse>> {
    return this.http.get<IResponseGeneric<IRolePermissionsResponse>>(`${this.apiUrl}${environment.EPRoles}/${roleId}/permissions`, { headers: this.headers });
  }

  actualizarPermisosDeRol(roleId: number, req: IUpdateRolePermissionsRequest): Observable<IResponseGeneric<IRolePermissionsResponse>> {
    return this.http.put<IResponseGeneric<IRolePermissionsResponse>>(`${this.apiUrl}${environment.EPRoles}/${roleId}/permissions`, req, { headers: this.headers });
  }

  obtenerRolesDeUsuario(userId: number): Observable<IResponseGeneric<IUserRolesResponse>> {
    return this.http.get<IResponseGeneric<IUserRolesResponse>>(`${this.apiUrl}${environment.EPUsersRoles}/${userId}/roles`, { headers: this.headers });
  }

  actualizarRolesDeUsuario(userId: number, req: IUpdateUserRolesRequest): Observable<IResponseGeneric<IUserRolesResponse>> {
    return this.http.put<IResponseGeneric<IUserRolesResponse>>(`${this.apiUrl}${environment.EPUsersRoles}/${userId}/roles`, req, { headers: this.headers });
  }

}
