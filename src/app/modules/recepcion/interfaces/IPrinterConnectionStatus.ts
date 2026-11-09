export interface IPrinterConnectionStatus {
  isConnected: boolean;
  printerId: number | null;
  printerName: string | null;
  lastConnectionAt: string | null;
  message: string | null;
}
