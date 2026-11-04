export interface IDriverLocation {
    employeeId: number;
    employeeName: string;
    latitude: number;
    longitude: number;
    accuracyMeters: number | null;
    recordedAt: string;
}
