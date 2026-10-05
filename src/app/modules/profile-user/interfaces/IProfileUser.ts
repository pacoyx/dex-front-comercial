export interface IResponseGeneric<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
  errors: string[];
}

export interface IMyProfile {
  id: number;
  name: string;
  userName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  photoUrl: string;
}

export interface IUpdateProfileRequest {
  name: string;
  email: string;
  phone: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface IUpdatePhotoRequest {
  fileName: string;
  blobUrl: string;
}

export interface IUpdatePhotoResponse {
  photoUrl: string;
}

export interface IMyDocument {
  id: number;
  documentName: string;
  fileName: string;
  blobUrl: string;
  notes: string;
  createdAt: string;
}

export interface ICreateDocumentRequest {
  documentName: string;
  fileName: string;
  blobUrl: string;
  notes?: string | null;
}
