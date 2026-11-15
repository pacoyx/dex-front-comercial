import { ISaleDetail, paymentLabel } from '../interfaces/IVentas';

/**
 * Imprime el ticket de una nota de venta (80 mm) desde el navegador.
 *
 * El ticket se arma como un documento HTML propio dentro de un iframe oculto y se imprime solo ese
 * iframe: no depende del layout de la aplicación (menú, barras) ni lo bloquea el navegador como una
 * ventana emergente después del cobro. Sirve igual para el punto de venta y para reimprimir.
 */
export function imprimirTicket(venta: ISaleDetail): void {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    return;
  }

  doc.open();
  doc.write(construirHtml(venta));
  doc.close();

  // Se imprime cuando el iframe terminó de cargar y se retira después del diálogo de impresión.
  const imprimir = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 1000);
  };
  if (doc.readyState === 'complete') {
    setTimeout(imprimir, 50);
  } else {
    iframe.onload = imprimir;
  }
}

function esc(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function money(value: number): string {
  return value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function qty(value: number): string {
  return value.toLocaleString('es-PE', { maximumFractionDigits: 4 });
}

function construirHtml(v: ISaleDetail): string {
  const fecha = new Date(v.saleDate).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const lineas = v.lines.map(l => `
    <tr><td colspan="3" class="desc">${esc(l.description)}</td></tr>
    <tr>
      <td>${qty(l.quantity)} ${esc(l.unitName ?? '')}</td>
      <td class="r">x ${money(l.unitPrice)}</td>
      <td class="r">${money(l.total)}</td>
    </tr>`).join('');

  const pago = esc(paymentLabel(v.paymentType)) + (v.paymentDescription ? ` (${esc(v.paymentDescription)})` : '');
  const efectivo = v.paymentType === 'EF'
    ? `<tr><td>Recibido</td><td class="r">${money(v.amountReceived)}</td></tr>
       <tr><td>Vuelto</td><td class="r">${money(v.change)}</td></tr>`
    : '';

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${esc(v.number)}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 4mm 3mm; width: 80mm; font-family: 'Courier New', monospace; font-size: 11px; color: #000; }
  .c { text-align: center; }
  .r { text-align: right; white-space: nowrap; }
  .b { font-weight: bold; }
  h1 { font-size: 14px; margin: 0 0 2px; }
  hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 1px 0; vertical-align: top; }
  td.desc { padding-top: 4px; }
  .total td { font-size: 13px; font-weight: bold; padding-top: 4px; }
  .anulada { border: 2px solid #000; padding: 4px; margin: 6px 0; font-weight: bold; }
</style></head>
<body>
  <div class="c">
    <h1>${esc(v.companyName)}</h1>
    ${v.companyDocument ? `<div>${esc(v.companyDocument)}</div>` : ''}
    ${v.companyAddress ? `<div>${esc(v.companyAddress)}</div>` : ''}
    ${v.companyPhone ? `<div>Tel. ${esc(v.companyPhone)}</div>` : ''}
    <hr>
    <div class="b">NOTA DE VENTA</div>
    <div class="b">${esc(v.number)}</div>
  </div>
  ${v.status === 2 ? '<div class="c anulada">*** ANULADA ***</div>' : ''}
  <hr>
  <table>
    <tr><td>Fecha</td><td class="r">${esc(fecha)}</td></tr>
    <tr><td>Cliente</td><td class="r">${esc(v.customerName)}</td></tr>
    ${v.customerDocument ? `<tr><td>Doc.</td><td class="r">${esc(v.customerDocument)}</td></tr>` : ''}
    <tr><td>Atendió</td><td class="r">${esc(v.userName)}</td></tr>
  </table>
  <hr>
  <table>${lineas}</table>
  <hr>
  <table>
    <tr><td>Op. gravada</td><td class="r">${money(v.subtotal)}</td></tr>
    <tr><td>IGV</td><td class="r">${money(v.igv)}</td></tr>
    <tr class="total"><td>TOTAL S/</td><td class="r">${money(v.total)}</td></tr>
  </table>
  <hr>
  <table>
    <tr><td>Pago</td><td class="r">${pago}</td></tr>
    ${efectivo}
  </table>
  ${v.notes ? `<hr><div>${esc(v.notes)}</div>` : ''}
  <hr>
  <div class="c">Documento interno, no válido como comprobante de pago.<br>¡Gracias por su compra!</div>
</body></html>`;
}
