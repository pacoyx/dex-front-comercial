/** Tarifa vigente del cliente, usada para armar los items de la guia de recojo. */
export interface ICustomerPriceListDetail {
  id: number;
  serviceItemId: number;
  serviceItemName: string;
  unitPrice: number;
}

export interface ICustomerPriceListActive {
  id: number;
  customerId: number;
  name: string;
  version: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  details: ICustomerPriceListDetail[];
}
