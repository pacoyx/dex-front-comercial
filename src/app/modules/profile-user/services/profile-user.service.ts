import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  IChangePasswordRequest,
  ICreateDocumentRequest,
  IMyDocument,
  IMyProfile,
  IResponseGeneric,
  IUpdatePhotoRequest,
  IUpdatePhotoResponse,
  IUpdateProfileRequest,
} from '../interfaces/IProfileUser';

@Injectable({
  providedIn: 'root'
})
export class ProfileUserService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  obtenerMiPerfil(): Observable<IResponseGeneric<IMyProfile>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IMyProfile>>(`${this.apiUrl}${environment.EPUserMe}`, { headers });
  }

  actualizarMiPerfil(req: IUpdateProfileRequest): Observable<IResponseGeneric<IMyProfile>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<IMyProfile>>(`${this.apiUrl}${environment.EPUserMe}`, req, { headers });
  }

  cambiarPassword(req: IChangePasswordRequest): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPUserMePassword}`, req, { headers });
  }

  actualizarFoto(req: IUpdatePhotoRequest): Observable<IResponseGeneric<IUpdatePhotoResponse>> {
    const formData = new FormData();
    formData.append('file', req.file);
    // No se setea el header Content-Type: el browser debe agregar el boundary del multipart.
    return this.http.post<IResponseGeneric<IUpdatePhotoResponse>>(`${this.apiUrl}${environment.EPUserMePhoto}`, formData);
  }

  obtenerFoto(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${environment.EPUserMePhoto}`, { responseType: 'blob' });
  }

  eliminarFoto(): Observable<IResponseGeneric<IUpdatePhotoResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<IResponseGeneric<IUpdatePhotoResponse>>(`${this.apiUrl}${environment.EPUserMePhoto}`, { headers });
  }

  listarMisDocumentos(): Observable<IResponseGeneric<IMyDocument[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IMyDocument[]>>(`${this.apiUrl}${environment.EPUserMeDocuments}`, { headers });
  }

  subirDocumento(req: ICreateDocumentRequest): Observable<IResponseGeneric<IMyDocument>> {
    const formData = new FormData();
    formData.append('file', req.file);
    formData.append('documentName', req.documentName);
    if (req.notes) formData.append('notes', req.notes);
    return this.http.post<IResponseGeneric<IMyDocument>>(`${this.apiUrl}${environment.EPUserMeDocuments}`, formData);
  }

  descargarDocumento(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${environment.EPUserMeDocuments}/${id}/download`, { responseType: 'blob' });
  }

  eliminarDocumento(id: number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPUserMeDocuments}/${id}`, { headers });
  }

}
