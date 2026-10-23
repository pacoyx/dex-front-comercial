import { IInvoiceDashboardSummary } from '../../facturacion/interfaces/IInvoiceDashboard';
import { IExpenseDashboardSummary } from '../../gastos/interfaces/IExpenseDashboard';
import { IPurchaseDashboardSummary } from '../../purchase/interfaces/IPurchaseDashboard';
import { IHrDashboardSummary } from '../../rrhh/interfaces/IHrDashboard';

export interface ICollectionsSummary {
  remindersSent: number;
  remindersFailed: number;
  remindersSkipped: number;
  lastRunAt: string | null;
}

export interface IOperationsSummary {
  totalPickupGuides: number;
  pendingPickupGuides: number;
  completedPickupGuides: number;
  totalAmount: number;
}

export interface IPaymentMethodBreakdownItem {
  method: string;
  amount: number;
  count: number;
}

export interface IReceptionIncomeSummary {
  monthIncome: number;
  monthAdvance: number;
  pendingBalance: number;
  guideCount: number;
  paymentMethodBreakdown: IPaymentMethodBreakdownItem[];
}

export interface IDeliverySummary {
  deliveryCount: number;
  deliveryAmount: number;
  receptionCount: number;
  receptionAmount: number;
  deliveryPending: number;
  deliveryCompleted: number;
}

export interface IExpenseBreakdownItem {
  category: string;
  amount: number;
  percentOfTotal: number;
}

export interface IBusinessSummary {
  totalIncome: number;
  totalExpenses: number;
  netResult: number;
  marginPercent: number;
  isProfitable: boolean;
  expenseBreakdown: IExpenseBreakdownItem[];
  totalPendingToCollect: number;
  pendingCollectionRatio: number;
}

// "invoicing", "expenses", "purchases" y "hr" son exactamente el mismo shape
// que ya devuelven los dashboards de cada modulo (un solo request agregado
// en vez de 4 llamadas separadas).
export interface IManagementDashboard {
  invoicing: IInvoiceDashboardSummary;
  collections: ICollectionsSummary;
  operations: IOperationsSummary;
  deliveries: IDeliverySummary;
  receptionIncome: IReceptionIncomeSummary;
  expenses: IExpenseDashboardSummary;
  purchases: IPurchaseDashboardSummary;
  hr: IHrDashboardSummary;
  businessSummary: IBusinessSummary;
}
