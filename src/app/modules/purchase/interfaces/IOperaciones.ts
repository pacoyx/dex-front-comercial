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

export interface IPurchaseInvoiceListItem {
    id: number;
    invoiceType: string;
    invoiceSerie: string;
    invoiceNumber: string;
    invoiceIssueDate: string;
    invoiceExpirationDate: string;
    typePayment: string;
    daysCredit: number;
    paymentMethod: string;
    total: number;
    status: string;
    amountPaid: number;
    balance: number;
    paymentStatus: number;
    purchaseDate: string;
    supplierId: number;
    supplierName: string;
}

export interface IPurchaseInvoiceListFilters {
    supplierId?: number;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
}

export interface IPurchaseInvoicePayment {
    id: number;
    purchaseInvoiceId: number;
    paymentMethodId: number;
    paymentMethodName: string;
    paymentDate: string;
    amount: number;
    operationNumber: string | null;
    observation: string | null;
}

export interface IRegisterPurchasePaymentRequest {
    paymentMethodId: number;
    amount: number;
    operationNumber?: string | null;
    observation?: string | null;
}

export interface IPurchaseInvoiceCancelResponse {
    id: number;
    paymentStatus: number;
}