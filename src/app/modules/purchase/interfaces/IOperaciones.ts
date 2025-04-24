export interface IInvoiceCreateRequest {
    supplierId: number;
    invoiceType: string;
    invoiceSerie: string;
    invoiceNumber: string;
    invoiceIssueDate: string;
    invoiceExpirationDate: string;
    typePayment: string;
    daysCredit: number;
    paymentMethod: string;
    currencyId:string;
    exchangeRate: number;
    comments: string;
    subtotal: number;
    igv: number;
    total: number;
    purchaseInvoiceDetails: PurchaseInvoiceDetail[];
}

interface PurchaseInvoiceDetail {
    productId: number;
    quantity: number;
    price: number;
    total: number;
}

export interface IInvoiceCreateResponse {
    id: number;
}


export interface PurchaseStoreInvoiceDetail {
    item: number;
    productId: number;
    productName: string;
    unitMeasurementId: number;
    unitMeasurement: string;
    quantity: number;
    price: number;
    total: number;
}