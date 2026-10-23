export interface ICompanyBankAccount {
  id: number;
  companyId: number;
  bankId: number;
  bankName: string;
  bankAccountTypeId: number;
  bankAccountTypeName: string;
  currencyId: string;
  accountNumber: string;
  interbankAccountNumber: string | null;
  description: string | null;
  isEnabled: boolean;
  isDetractionAccount: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ICompanyBankAccountRequest {
  bankId: number;
  bankAccountTypeId: number;
  currencyId: string;
  accountNumber: string;
  interbankAccountNumber: string | null;
  description: string | null;
  notes: string | null;
  isDetractionAccount: boolean;
}

export interface ICurrencyOption {
  value: string;
  label: string;
}

// Fase 1: no existe catalogo de monedas en el backend (igual que Invoice.CurrencyId en
// Facturacion), es un codigo ISO de 3 letras en texto plano. Si se necesitan mas monedas
// hay que agregarlas aqui.
export const COMPANY_BANK_ACCOUNT_CURRENCIES: ICurrencyOption[] = [
  { value: 'PEN', label: 'Soles (PEN)' },
  { value: 'USD', label: 'Dólares (USD)' },
];
