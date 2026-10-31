import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../../../core/interfaces/IShared';
import { ICreateSharedDocumentRequest, ISharedDocument } from '../interfaces/ISharedDocument';

@Injectable({
  providedIn: 'root'
})
export class SharedDocumentsService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  listarCompartidosPorMi(): Observable<IResponseGeneric<ISharedDocument[]>> {
    return this.http.get<IResponseGeneric<ISharedDocument[]>>(`${this.apiUrl}${environment.EPSharedDocuments}`);
  }

  /**
   * No se setea el header Content-Type: el browser arma el boundary del
   * multipart/form-data automaticamente.
   */
  compartir(req: ICreateSharedDocumentRequest): Observable<IResponseGeneric<ISharedDocument>> {
    const formData = new FormData();
    formData.append('title', req.title);
    formData.append('category', req.category);
    if (req.notes) formData.append('notes', req.notes);
    formData.append('file', req.file);
    req.recipientUserIds.forEach(id => formData.append('recipientUserIds', String(id)));

    return this.http.post<IResponseGeneric<ISharedDocument>>(`${this.apiUrl}${environment.EPSharedDocuments}`, formData);
  }

  eliminar(id: number): Observable<IResponseGeneric<string>> {
    return this.http.delete<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPSharedDocuments}/${id}`);
  }

}
