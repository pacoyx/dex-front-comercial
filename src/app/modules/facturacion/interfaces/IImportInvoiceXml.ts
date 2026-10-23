export interface IImportInvoiceXmlLine {
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  sellerItemCode: string | null;
}

export interface IImportInvoiceXmlPreview {
  customerId: number;
  customerName: string;
  documentTypeId: number;
  serie: string;
  numero: string;
  issueDate: string;
  dueDate: string;
  currencyId: string;
  typePayment: string;
  daysCredit: number;
  subTotal: number;
  igv: number;
  total: number;
  hasDetraction: boolean;
  detractionPercent: number | null;
  detractionAmount: number | null;
  detractionAccountMatches: boolean;
  detractionWarning: string | null;
  details: IImportInvoiceXmlLine[];
}

export interface IConfirmImportInvoiceXmlLine {
  productId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IConfirmImportInvoiceXmlRequest {
  customerId: number;
  branchId: number;
  documentTypeId: number;
  serie: string;
  numero: string;
  currencyId: string;
  exchangeRate: number;
  issueDate: string;
  dueDate: string;
  paymentMethod: string;
  typePayment: string;
  daysCredit: number;
  subTotal: number;
  igv: number;
  total: number;
  hasDetraction: boolean;
  detractionPercent: number | null;
  detractionAmount: number | null;
  notes: string | null;
  details: IConfirmImportInvoiceXmlLine[];
}

// Linea de la vista previa con el producto que el usuario va asignando en pantalla
// (no existe en el backend, es puramente un modelo de UI para el paso intermedio).
export interface IImportInvoiceXmlLineDraft extends IImportInvoiceXmlLine {
  productId: number | null;
  productName: string | null;
}
