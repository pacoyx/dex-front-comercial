export interface IValuationReportFilters {
  customerId: number;
  fromDate: string;
  toDate: string;
}

export interface IValuationReportGuideRow {
  id: number;
  guideNumber: string;
  pickupDate: string;
  status: string;
  totalAmount: number;
  hasPhysicalGuidePhoto: boolean;
}

export interface IValuationReportServiceColumn {
  serviceItemId: number;
  serviceName: string;
  isPricedByWeight: boolean;
}

export interface IValuationReportPivotRow {
  date: string;
  /**
   * Indexado por serviceItemId (las claves llegan como string por ser JSON, se accede
   * igual con numero). Si un servicio no tuvo movimiento en esa fecha, la clave no viene
   * en el diccionario -> tratar como undefined/0.
   */
  quantitiesByServiceItemId: Record<number, number | undefined>;
  rowTotal: number;
}

export interface IValuationReportPivot {
  services: IValuationReportServiceColumn[];
  rows: IValuationReportPivotRow[];
  columnTotals: Record<number, number | undefined>;
  grandTotal: number;
}

export interface IValuationReportResponse {
  customerName: string;
  guides: IValuationReportGuideRow[];
  pivot: IValuationReportPivot;
  photoCount: number;
}
