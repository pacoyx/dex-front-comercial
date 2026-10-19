import { UpsertSneakerDetailRequest } from '../interfaces/IInspeccion';

export function formatearZapatillaDraft(draft: UpsertSneakerDetailRequest, brandName?: string | null): string {
  const partes: string[] = [];

  if (brandName) {
    partes.push(brandName);
  }

  const colores = [draft.primaryColor, draft.secondaryColor].filter((c): c is string => !!c);
  if (colores.length > 0) {
    partes.push(colores.join('/'));
  }

  if (draft.hasLaces) {
    partes.push('Sin Cordones');
  }
  if (draft.hasInsoles) {
    partes.push('Sin Plantillas');
  }

  if (draft.observations) {
    partes.push(draft.observations);
  }

  return partes.join(' | ');
}
