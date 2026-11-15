import { IGeneratePayrollResponse } from '../interfaces/IPayroll';

/** Mensaje de resultado al generar una planilla. */
export function mensajePlanillaGenerada(resp: IGeneratePayrollResponse): string {
  let mensaje = `Planilla generada: ${resp.generatedCount} trabajador(es) procesados, ${resp.skippedCount} ya tenían planilla.`;
  if (resp.adHonoremSkippedCount > 0) {
    mensaje += ` ${resp.adHonoremSkippedCount} ad honorem omitido(s) (sin pago).`;
  }
  return mensaje;
}
